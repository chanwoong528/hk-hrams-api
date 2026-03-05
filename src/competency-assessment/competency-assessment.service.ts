import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetencyAssessment } from './competency-assessment.entity';
import { UpdateCompetencyAssessmentDto } from './dto/update-competency-assessment.dto';

@Injectable()
export class CompetencyAssessmentService {
  constructor(
    @InjectRepository(CompetencyAssessment)
    private readonly competencyAssessmentRepository: Repository<CompetencyAssessment>,
  ) {}

  /**
   * Fetch all competency assessments for a specific user (either as self or as leader evaluator)
   * within a specific appraisal (optionally filtered).
   */
  async getAssessmentsForUser(appraisalUserId: string) {
    return this.competencyAssessmentRepository.find({
      where: {
        appraisalUser: { appraisalUserId },
      },
      relations: [
        'competencyQuestion',
        'competencyQuestion.department',
        'appraisalUser',
        'appraisalUser.owner',
        'evaluator',
      ],
    });
  }

  /**
   * Update the grade/comment for a specific assessment.
   * Typically called when a user submits their self-assessment, or a leader submits their review.
   */
  async updateAssessment(
    assessmentId: string,
    evaluatorId: string,
    dto: UpdateCompetencyAssessmentDto,
  ) {
    const assessment = await this.competencyAssessmentRepository.findOne({
      where: { assessmentId, evaluator: { userId: evaluatorId } },
    });

    if (!assessment) {
      throw new NotFoundException(
        'Assessment not found or you are not the evaluator.',
      );
    }

    if (dto.grade !== undefined) assessment.grade = dto.grade;
    if (dto.comment !== undefined) assessment.comment = dto.comment;

    return this.competencyAssessmentRepository.save(assessment);
  }
}
