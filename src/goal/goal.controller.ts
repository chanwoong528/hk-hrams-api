import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreateGoalPayload } from './goal.dto';
import { GoalService } from './goal.service';
import { Goal } from './goal.entity';
import { Response } from 'src/common/api-reponse/response-type';

@Controller('goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post() async createGoal(
    @Body() createGoalPayload: CreateGoalPayload,
  ): Promise<Response<Goal>> {
    const data = await this.goalService.createGoal(createGoalPayload);
    return {
      statusCode: 201,
      message: 'Goal created successfully',
      data,
    };
  }

  @Get() async getAllGoals(): Promise<Response<Goal[]>> {
    const data = await this.goalService.getAllGoals();
    return {
      statusCode: 200,
      message: 'Goals fetched successfully',
      data,
    };
  }
}
