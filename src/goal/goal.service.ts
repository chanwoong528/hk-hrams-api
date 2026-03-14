import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Goal } from './goal.entity';
import {
  CreateCommonGoalPayload,
  CreateGoalPayload,
  UpdateCommonGoalPayload,
  DeleteCommonGoalPayload,
} from './goal.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { GoalAssessmentBy } from 'src/goal-assessment-by/goal-assessment-by.entity';
import { AppraisalUserService } from 'src/appraisal-user/appraisal-user.service';
import { DepartmentService } from 'src/department/department.service';
import { HramsUserDepartmentService } from 'src/hrams-user-department/hrams-user-department.service';

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);
  private readonly customException = new CustomException('Goal');

  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    private readonly appraisalUserService: AppraisalUserService,

    private readonly departmentService: DepartmentService,
    private readonly hramsUserDepartmentService: HramsUserDepartmentService,
  ) { }

  async createGoal(
    createGoalPayload: CreateGoalPayload,
    userId: string,
  ): Promise<Goal[]> {
    try {
      const appraisalUser =
        await this.appraisalUserService.getAppraisalUserByUserIdAndAppraisalId(
          userId,
          createGoalPayload.appraisalId,
        );

      if (!appraisalUser) {
        throw new NotFoundException('Appraisal user not found');
      }

      const goals = createGoalPayload.goals.map((goal) => {
        console.log('[DEBUG] Creating goal with type:', goal.goalType);
        return this.goalRepository.create({
          ...goal,
          appraisalUser,
        });
      });
      const savedGoals = await this.goalRepository.save(goals);

      return savedGoals;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async getGoalByUserIdAndAppraisalId(
    userId: string,
    appraisalId: string,
  ): Promise<Goal[]> {
    try {
      console.log('userId>> ', userId);
      console.log('appraisalId>> ', appraisalId);

      const goals = await this.goalRepository.find({
        where: {
          appraisalUser: {
            owner: { userId },
            appraisal: { appraisalId },
          },
        },
        relations: ['appraisalUser'],
      });

      return goals;
    } catch (error) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async getGoal(
    goalId: string,
  ): Promise<Goal & { goalAssessmentBy: GoalAssessmentBy[] }> {
    try {
      const goal = await this.goalRepository.findOne({
        where: { goalId },
        relations: ['goalAssessmentBy', 'goalAssessmentBy.gradedByUser'],
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      return goal;
    } catch (error) {
      this.logger.error(`Failed to get goal ${goalId}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to retrieve goal');
    }
  }

  async getAllGoals(): Promise<
    (Goal & { goalAssessmentBy: GoalAssessmentBy[] })[]
  > {
    //TODO: order maybe or paging
    try {
      return await this.goalRepository.find({
        relations: ['goalAssessmentBy', 'goalAssessmentBy.gradedByUser'],
        order: { created: 'DESC' },
      });
    } catch (error) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async createCommonGoalByLeader(
    createCommonGoalPayload: CreateCommonGoalPayload,
    leaderId: string,
  ): Promise<Goal[]> {
    try {
      if (!leaderId) {
        throw new BadRequestException('Leader ID is required');
      }

      const isLeader = await this.hramsUserDepartmentService.isLeader(
        leaderId,
        createCommonGoalPayload.departmentId,
      );

      if (!isLeader) {
        throw new BadRequestException('User is not a leader');
      }

      const teamMeber =
        await this.departmentService.getTeamMembersByDepartmentId(
          createCommonGoalPayload.departmentId,
        );

      // console.log('@@teamMeber>> ', teamMeber);

      const createCommonGoalsEveryTeamMember = await Promise.allSettled(
        teamMeber.map(async (member) => {
          // Side Effect: Reset status to 'ongoing' if currently 'submitted'
          // We need to find the specific appraisalUser for this member and appraisalId
          const appraisalUser = await this.appraisalUserService.getAppraisalUserByUserIdAndAppraisalId(
            member.user_userId,
            createCommonGoalPayload.appraisalId
          );

          console.log(`[GoalService] Processing member: ${member.user_userId} for Appraisal: ${createCommonGoalPayload.appraisalId}`);

          if (appraisalUser) {
            console.log(`[GoalService] Processing for member: ${member.user_userId}, Current Status: ${appraisalUser.status}`);
            // Status reset removed as per user request to prevent re-doing assessments
          } else {
            console.log(`[GoalService] AppraisalUser NOT FOUND for member: ${member.user_userId}`);
          }

          return this.createGoal(
            {
              appraisalId: createCommonGoalPayload.appraisalId,
              goals: createCommonGoalPayload.goals.map(g => ({ ...g, goalType: 'common' })),
            },
            member.user_userId,
          );
        }),
      );

      return createCommonGoalsEveryTeamMember
        .map((result) => (result.status === 'fulfilled' ? result.value : []))
        .flat();
    } catch (error) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async updateCommonGoalByLeader(
    updateCommonGoalPayload: UpdateCommonGoalPayload,
    leaderId: string,
  ): Promise<any> {
    try {
      if (!leaderId) {
        throw new BadRequestException('Leader ID is required');
      }

      const isLeader = await this.hramsUserDepartmentService.isLeader(
        leaderId,
        updateCommonGoalPayload.departmentId,
      );

      if (!isLeader) {
        throw new BadRequestException('User is not a leader');
      }

      const teamMembers =
        await this.departmentService.getTeamMembersByDepartmentId(
          updateCommonGoalPayload.departmentId,
        );

      const teamUserIds = teamMembers.map((m) => m.user_userId);

      // 1. Find all goals that belong to these users AND have the old title
      // We need to join with AppraisalUser -> HramsUser
      const goalsToUpdate = await this.goalRepository
        .createQueryBuilder('goal')
        .innerJoinAndSelect('goal.appraisalUser', 'appraisalUser')
        .innerJoinAndSelect('appraisalUser.owner', 'owner')
        .where('owner.userId IN (:...teamUserIds)', { teamUserIds })
        // We probably also want to filter by appraisalId to be safe
        .andWhere('appraisalUser.appraisalId = :appraisalId', {
          appraisalId: updateCommonGoalPayload.appraisalId,
        })
        .andWhere('goal.title = :oldTitle', {
          oldTitle: updateCommonGoalPayload.oldTitle,
        })
        .getMany();

      if (goalsToUpdate.length === 0) {
        throw new NotFoundException('No common goals found to update');
      }

      // 2. Update them
      await this.goalRepository
        .createQueryBuilder()
        .update(Goal)
        .set({
          title: updateCommonGoalPayload.newTitle,
          description: updateCommonGoalPayload.newDescription,
        })
        .where('goalId IN (:...ids)', { ids: goalsToUpdate.map((g) => g.goalId) })
        .execute();

      return {
        message: 'Common goal updated for all team members',
      } as any; // Temporary fix or change return type in signature
    } catch (e) {
      console.error(e);
      throw new CustomException('Failed to update common goal');
    }
  }

  async deleteCommonGoalByLeader(
    leaderId: string,
    payload: DeleteCommonGoalPayload,
  ) {
    // 1. Check if the user is a leader of the department
    const isLeader = await this.hramsUserDepartmentService.isLeader(
      leaderId,
      payload.departmentId,
    );

    if (!isLeader) {
      throw new BadRequestException('User is not a leader');
    }

    // 2. Find goals for team members that match the title and appraisalId
    try {
      // Get all team members first to filter their goals
      const teamMembers =
        await this.departmentService.getTeamMembersByDepartmentId(
          payload.departmentId,
        );

      if (!teamMembers.length) {
        return { message: 'No team members found' };
      }

      const teamUserIds = teamMembers.map(u => u.user_userId);

      const goalsToDelete = await this.goalRepository
        .createQueryBuilder('goal')
        .innerJoin('goal.appraisalUser', 'appraisalUser') // Join with appraisalUser
        .innerJoin('appraisalUser.owner', 'owner') // Join with owner (HramsUser)
        .where('owner.userId IN (:...userIds)', { userIds: teamUserIds })
        .andWhere('appraisalUser.appraisalId = :appraisalId', { // Filter by appraisalId on appraisalUser
          appraisalId: payload.appraisalId,
        })
        .andWhere('goal.title = :title', { title: payload.title })
        .getMany();

      if (goalsToDelete.length > 0) {
        await this.goalRepository.remove(goalsToDelete);
      }

      return {
        message: `${goalsToDelete.length} common goals deleted successfully`,
      };
    } catch (e) {
      console.error(e);
      throw new CustomException('Failed to delete common goal');
    }
    // ... existing code ...
  }

  async updateGoal(
    goalId: string,
    userId: string,
    payload: { title: string; description: string },
  ) {
    try {
      const goal = await this.goalRepository.findOne({
        where: { goalId },
        relations: ['appraisalUser', 'appraisalUser.owner'],
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      if (goal.appraisalUser.owner.userId !== userId) {
        throw new BadRequestException('You are not the owner of this goal');
      }

      goal.title = payload.title;
      goal.description = payload.description;

      return await this.goalRepository.save(goal);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async deleteGoal(goalId: string, userId: string) {
    try {
      const goal = await this.goalRepository.findOne({
        where: { goalId },
        relations: ['appraisalUser', 'appraisalUser.owner'],
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      if (goal.appraisalUser.owner.userId !== userId) {
        throw new BadRequestException('You are not the owner of this goal');
      }

      return await this.goalRepository.remove(goal);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
