import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GoalAssessmentByService } from './goal-assessment-by.service';
import { CreateGoalAssessmentByPayload } from './goal-assessment-by.dto';
import { GoalAssessmentBy } from './goal-assessment-by.entity';
import { Response } from 'src/common/api-reponse/response-type';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('목표 평가 (Goal Assessment)')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('goal-assessment-by')
export class GoalAssessmentByController {
  constructor(
    private readonly goalAssessmentByService: GoalAssessmentByService,
  ) {}

  @ApiOperation({ summary: '목표 평가 생성', description: '특정 목표에 대한 개별 평가(등급, 코멘트)를 생성합니다.' })
  @ApiResponse({ status: 201, description: '목표 평가 생성 성공' })
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
