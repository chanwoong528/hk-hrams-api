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
  ) {}

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
          creator: { userId },
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
      const leaderId = userId; // Assuming the creator is the leader grading them

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
          // Only add if the leader is not evaluating themselves (to avoid unique constraint violation)
          if (appraisalUser.owner.userId !== leaderId) {
            assessmentsToSave.push(
              this.competencyAssessmentRepository.create({
                competencyQuestion: question,
                appraisalUser: appraisalUser,
                evaluator: { userId: leaderId }, // Leader
              }),
            );
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
}
