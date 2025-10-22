import { Controller, Post, Body } from '@nestjs/common';
import { GoalAssessmentByService } from './goal-assessment-by.service';
import { CreateGoalAssessmentByPayload } from './goal-assessment-by.dto';
import { GoalAssessmentBy } from './goal-assessment-by.entity';
import { Response } from 'src/common/api-reponse/response-type';

@Controller('goal-assessment-by')
export class GoalAssessmentByController {
  constructor(
    private readonly goalAssessmentByService: GoalAssessmentByService,
  ) {}

  @Post()
  async createGoalAssessmentBy(
    @Body() createGoalAssessmentByPayload: CreateGoalAssessmentByPayload,
  ): Promise<Response<GoalAssessmentBy>> {
    const data = await this.goalAssessmentByService.createGoalAssessmentBy(
      createGoalAssessmentByPayload,
    );
    return {
      statusCode: 201,
      message: 'Goal assessment by created successfully',
      data,
    };
  }
}
