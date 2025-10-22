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
      const goalAssessmentBy = this.goalAssessmentByRepository.create(
        createGoalAssessmentByPayload,
      );
      return await this.goalAssessmentByRepository.save(goalAssessmentBy);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
