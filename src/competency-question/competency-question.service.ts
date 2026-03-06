import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CompetencyQuestion } from './competency-question.entity';
import { CompetencyAssessment } from '../competency-assessment/competency-assessment.entity';
import { AppraisalUser } from '../appraisal-user/appraisal-user.entity';
import { CreateCompetencyQuestionsDto } from './dto/create-competency-questions.dto';

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
      // 0. Check for existing questions to preserve original creator
      const existingQuestion = await queryRunner.manager.findOne(CompetencyQuestion, {
        where: {
          appraisal: { appraisalId: dto.appraisalId },
          department: { departmentId: dto.departmentId }
        }
      });

      const originalCreatorId = existingQuestion ? existingQuestion.createdBy : userId;
      const isModification = !!existingQuestion;

      // 1. Delete existing questions (and cascade evaluations if they exist) to replace them
      await queryRunner.manager.delete(CompetencyQuestion, {
        appraisal: { appraisalId: dto.appraisalId },
        department: { departmentId: dto.departmentId },
      });

      // 2. Create the new Competency Questions
      const questionsToSave = dto.questions.map((q) =>
        this.competencyQuestionRepository.create({
          appraisal: { appraisalId: dto.appraisalId },
          department: { departmentId: dto.departmentId },
          creator: { userId: originalCreatorId },
          lastModifier: isModification ? { userId } : undefined,
          question: q,
        }),
      );
      const savedQuestions = await queryRunner.manager.save(
        CompetencyQuestion,
        questionsToSave,
      );

      // 3. Find all AppraisalUser records for this Appraisal whose owners belong to the Department
      // We need a join on the owner (HramsUser) and their HramsUserDepartment link
      const appraisalUsers = await queryRunner.manager
        .createQueryBuilder(AppraisalUser, 'au')
        .innerJoinAndSelect('au.owner', 'user')
        .innerJoin('user.hramsUserDepartments', 'hud')
        .where('au.appraisalId = :appraisalId', {
          appraisalId: dto.appraisalId,
        })
        .andWhere('hud.departmentId = :departmentId', {
          departmentId: dto.departmentId,
        })
        .getMany();

      // 4. Create the Assessment records (Self + Leader)
      const assessmentsToSave: CompetencyAssessment[] = [];

      // Find actual leaders of this department
      const departmentLeaders = await queryRunner.manager
        .createQueryBuilder('HramsUserDepartment', 'hud')
        .where('hud.departmentId = :departmentId', { departmentId: dto.departmentId })
        .andWhere('hud.isLeader = true')
        .getMany();

      const leaderIds = departmentLeaders.map((dl: any) => dl.userId);

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

          // Leader Assessment record
          for (const actualLeaderId of leaderIds) {
            // Only add if the leader is not evaluating themselves (to avoid unique constraint violation)
            if (appraisalUser.owner.userId !== actualLeaderId) {
              assessmentsToSave.push(
                this.competencyAssessmentRepository.create({
                  competencyQuestion: question,
                  appraisalUser: appraisalUser,
                  evaluator: { userId: actualLeaderId }, // Actual Leader
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

      const groupId = `${q.appraisal.appraisalId}_${q.department.departmentId}`;

      if (!groupedMap.has(groupId)) {
        groupedMap.set(groupId, {
          appraisalId: q.appraisal.appraisalId,
          appraisalTitle: q.appraisal.title,
          departmentId: q.department.departmentId,
          departmentName: q.department.departmentName,
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
