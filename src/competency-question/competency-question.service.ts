import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { CompetencyQuestion } from './competency-question.entity';
import { CompetencyAssessment } from '../competency-assessment/competency-assessment.entity';
import { AppraisalUser } from '../appraisal-user/appraisal-user.entity';
import { CreateCompetencyQuestionsDto } from './dto/create-competency-questions.dto';
import { Department } from '../department/department.entity';
import { HramsUserDepartment } from '../hrams-user-department/hrams-user-department.entity';
import { Appraisal } from '../appraisal/appraisal.entity';
import { HramsUser } from '../hrams-user/hrams-user.entity';

@Injectable()
export class CompetencyQuestionService {
  constructor(
    @InjectRepository(CompetencyQuestion)
    private readonly competencyQuestionRepository: Repository<CompetencyQuestion>,
    @InjectRepository(CompetencyAssessment)
    private readonly competencyAssessmentRepository: Repository<CompetencyAssessment>,
    @InjectRepository(AppraisalUser)
    private readonly appraisalUserRepository: Repository<AppraisalUser>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * 1. Creates/Replaces the Competency Questions for a Department/Appraisal.
   * 2. Finds all AppraisalUsers mapped to the HramsUsers in this Department.
   * 3. Creates CompetencyAssessment records (self and leader) for each combination.
   */
  async createQuestionsAndAssignToDepartment(
    userId: string, // The leader's ID
    dto: CreateCompetencyQuestionsDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Normalize 'all' or empty to null for database targeting
      const targetJobGroup = (dto.jobGroup === 'all' || !dto.jobGroup) ? null : dto.jobGroup;

      // 0. Check for existing questions
      const existingQuery = queryRunner.manager.createQueryBuilder(CompetencyQuestion, 'cq')
        .where('cq.appraisalId = :appraisalId', { appraisalId: dto.appraisalId })
        .andWhere('cq.departmentId = :departmentId', { departmentId: dto.departmentId });

      if (targetJobGroup === null) {
        existingQuery.andWhere('cq.jobGroup IS NULL');
      } else {
        existingQuery.andWhere('cq.jobGroup = :jobGroup', { jobGroup: targetJobGroup });
      }

      const existingQuestion = await existingQuery.getOne();
      const originalCreatorId = existingQuestion ? existingQuestion.createdBy : userId;
      const isModification = !!existingQuestion;

      // 1. Delete ALL existing CompetencyQuestion records for this exact combination
      // NOTE: This will CASCADE delete linked CompetencyAssessment records
      const deleteQuery = queryRunner.manager.createQueryBuilder()
        .delete()
        .from(CompetencyQuestion)
        .where('appraisalId = :appraisalId', { appraisalId: dto.appraisalId })
        .andWhere('departmentId = :departmentId', { departmentId: dto.departmentId });

      if (targetJobGroup === null) {
        deleteQuery.andWhere('jobGroup IS NULL');
      } else {
        deleteQuery.andWhere('jobGroup = :jg', { jg: targetJobGroup });
      }

      await deleteQuery.execute();

      // 2. Create the new Competency Questions
      const questionsToSave = dto.questions.map((q) =>
        this.competencyQuestionRepository.create({
          appraisal: { appraisalId: dto.appraisalId },
          department: { departmentId: dto.departmentId },
          jobGroup: targetJobGroup,
          creator: { userId: originalCreatorId },
          lastModifier: isModification ? { userId } : undefined,
          question: q,
        }),
      );
      const savedQuestions = await queryRunner.manager.save(
        CompetencyQuestion,
        questionsToSave,
      );

      // 3. Find all AppraisalUsers for the given Department (and Job Group)
      // Hierarchical Choice: include all sub-departments as well if questions are set at a higher level
      const targetDeptForUsers = await queryRunner.manager.findOne(Department, {
        where: { departmentId: dto.departmentId },
      });
      
      let departmentIdsForUsers = [dto.departmentId];
      if (targetDeptForUsers) {
        const descendants = await queryRunner.manager
          .getTreeRepository(Department)
          .findDescendants(targetDeptForUsers);
        departmentIdsForUsers = Array.from(new Set([
          ...departmentIdsForUsers,
          ...descendants.map(d => d.departmentId)
        ]));
      }

      const userQuery = queryRunner.manager
        .createQueryBuilder(AppraisalUser, 'au')
        .innerJoinAndSelect('au.owner', 'user')
        .innerJoin('user.hramsUserDepartments', 'hud')
        .where('au.appraisalId = :appraisalId', {
          appraisalId: dto.appraisalId,
        })
        .andWhere('hud.departmentId IN (:...deptIds)', {
          deptIds: departmentIdsForUsers,
        });

      if (targetJobGroup !== null) {
        userQuery.andWhere('user.jobGroup = :jobGroup', {
          jobGroup: targetJobGroup,
        });
      }

      const appraisalUsers = await userQuery.getMany();

      // 4. Create the Assessment records (Self + Hierarchical/Rank-based Evaluators)
      const assessmentsToSave: CompetencyAssessment[] = [];

      // Fetch the appraisal to get rank limits
      const appraisal = await queryRunner.manager.findOne('Appraisal', {
        where: { appraisalId: dto.appraisalId },
      }) as any;

      const minRank = appraisal?.minGradeRank;
      const maxRank = appraisal?.maxGradeRank;

      // Find everyone in this department AND its ancestors who meets the rank criteria
      const targetDept = await queryRunner.manager.findOne(Department, {
        where: { departmentId: dto.departmentId },
      });

      let departmentIdsForEvaluators = [dto.departmentId];
      if (targetDept) {
        const ancestors = await queryRunner.manager
          .getTreeRepository(Department)
          .findAncestors(targetDept);
        departmentIdsForEvaluators = Array.from(new Set([
          ...departmentIdsForEvaluators,
          ...ancestors.map(a => a.departmentId)
        ]));
      }

      const potentialEvaluatorsQuery = queryRunner.manager
        .createQueryBuilder(HramsUserDepartment, 'hud')
        .innerJoinAndSelect('hud.department', 'dept')
        .innerJoinAndSelect('hud.user', 'user')
        .where('hud.departmentId IN (:...deptIds)', { deptIds: departmentIdsForEvaluators })
        .andWhere('hud.isLeader = true');

      if (minRank !== null && minRank !== undefined) {
        potentialEvaluatorsQuery.andWhere('dept.rank <= :minRank', { minRank });
      }
      if (maxRank !== null && maxRank !== undefined) {
        // Change logic to allow seniors (lower rank values) if they are ancestors
        // Or keep it as is if 'maxGradeRank' truly means the most senior rank allowed.
        // Given 'Exclude Room Chief' (1) and max=2, >= 2 is correct to exclude 1.
        potentialEvaluatorsQuery.andWhere('dept.rank >= :maxRank', { maxRank });
      }

      const potentialEvaluators = await potentialEvaluatorsQuery.getMany();

      for (const appraisalUser of appraisalUsers) {
        for (const question of savedQuestions) {
          // Self Assessment record
          assessmentsToSave.push(
            this.competencyAssessmentRepository.create({
              competencyQuestion: question,
              appraisalUser: appraisalUser,
              evaluator: { userId: appraisalUser.owner.userId }, // Self
            }),
          );

          // Hierarchical Assessment records
          for (const evaluator of potentialEvaluators) {
            const evaluatorId = evaluator.userId;
            // Only add if the evaluator is not the target user (handled above as self)
            if (appraisalUser.owner.userId !== evaluatorId) {
              assessmentsToSave.push(
                this.competencyAssessmentRepository.create({
                  competencyQuestion: question,
                  appraisalUser: appraisalUser,
                  evaluator: { userId: evaluatorId },
                }),
              );
            }
          }
        }
      }

      await queryRunner.manager.save(CompetencyAssessment, assessmentsToSave);
      await queryRunner.commitTransaction();

      return {
        message: 'Competency questions and assessments generated successfully.',
        questionsCreated: savedQuestions.length,
        assessmentsGenerated: assessmentsToSave.length,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Fetch competency questions based on role.
   * If HR Admin: Return all questions.
   * If normal leader: Return only questions created by this leader.
   */
  async getQuestions(userId: string) {
    // Check if the user is in the HR department
    const isHr = await this.dataSource.manager
      .createQueryBuilder('HramsUserDepartment', 'hud')
      .innerJoin('hud.department', 'dept')
      .where('hud.userId = :userId', { userId })
      .andWhere('LOWER(dept.departmentName) = :name', { name: 'hr' })
      .getOne();

    const query = this.competencyQuestionRepository
      .createQueryBuilder('cq')
      .leftJoinAndSelect('cq.appraisal', 'appraisal')
      .leftJoinAndSelect('cq.department', 'department')
      .leftJoinAndSelect('cq.creator', 'creator')
      .leftJoinAndSelect('cq.lastModifier', 'lastModifier')
      .orderBy('cq.created', 'DESC');

    if (!isHr) {
      // Normal leader - see questions for departments they lead
      const leaderDepts = await this.dataSource.manager
        .createQueryBuilder('HramsUserDepartment', 'hud')
        .where('hud.userId = :userId', { userId })
        .andWhere('hud.isLeader = true')
        .getMany();

      const deptIds = leaderDepts.map(d => d.departmentId);

      if (deptIds.length === 0) {
        return []; // If they lead 0 departments, return empty
      }

      query.where('department.departmentId IN (:...deptIds)', { deptIds });
    }

    const rawData = await query.getMany();

    // Group the raw data by appraisalId -> departmentId
    const groupedMap = new Map<string, any>();

    for (const q of rawData) {
      if (!q.appraisal || !q.department) continue;

      const displayJobGroup = q.jobGroup || 'all';
      // Include displayJobGroup in the key explicitly
      const groupId = `${q.appraisal.appraisalId}_${q.department.departmentId}_${displayJobGroup}`;

      if (!groupedMap.has(groupId)) {
        groupedMap.set(groupId, {
          appraisalId: q.appraisal.appraisalId,
          appraisalTitle: q.appraisal.title,
          departmentId: q.department.departmentId,
          departmentName: q.department.departmentName,
          jobGroup: q.jobGroup, // Keep original jobGroup or null/undefined
          displayJobGroup: displayJobGroup, // Use for UI display
          creatorId: q.creator?.userId,
          creatorName: q.creator?.koreanName,
          lastModifierId: q.lastModifier?.userId,
          lastModifierName: q.lastModifier?.koreanName,
          created: q.created,
          questions: [],
        });
      }

      groupedMap.get(groupId).questions.push(q.question);
    }

    return Array.from(groupedMap.values());
  }
}
