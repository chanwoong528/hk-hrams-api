import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { GoalAssessmentBy } from './goal-assessment-by.entity';
import { CreateGoalAssessmentByPayload } from './goal-assessment-by.dto';

import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class GoalAssessmentByService {
  private readonly customException = new CustomException('GoalAssessmentBy');

  constructor(
    @InjectRepository(GoalAssessmentBy)
    private readonly goalAssessmentByRepository: Repository<GoalAssessmentBy>,
  ) {}

  async createGoalAssessmentBy(
    createGoalAssessmentByPayload: CreateGoalAssessmentByPayload,
  ): Promise<GoalAssessmentBy> {
    try {
      // Upsert: if exists for goalId + gradedBy, update it
      // We need to check if it exists first or use upsert options if unique constraint exists
      // Entity has @Unique(['goalId', 'gradedBy'])
      
      const existing = await this.goalAssessmentByRepository.findOne({
        where: {
          goalId: createGoalAssessmentByPayload.goalId,
          gradedBy: createGoalAssessmentByPayload.gradedBy,
        },
      });

      if (existing) {
        existing.grade = createGoalAssessmentByPayload.grade;
        existing.comment = createGoalAssessmentByPayload.comment;
        return await this.goalAssessmentByRepository.save(existing);
      }

      const newAssessment = this.goalAssessmentByRepository.create(
        createGoalAssessmentByPayload,
      );
      return await this.goalAssessmentByRepository.save(newAssessment);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
