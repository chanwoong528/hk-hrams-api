import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Goal } from './goal.entity';
import { CreateGoalPayload } from './goal.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { GoalAssessmentBy } from 'src/goal-assessment-by/goal-assessment-by.entity';
import { AppraisalUserService } from 'src/appraisal-user/appraisal-user.service';

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);
  private readonly customException = new CustomException('Goal');

  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    private readonly appraisalUserService: AppraisalUserService,
  ) {}

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
          appraisalUser: { owner: { userId } },
          // appraisal: { appraisalId },
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
}
