import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateGoalPayload } from './goal.dto';
import { GoalService } from './goal.service';
import { Goal } from './goal.entity';
import { Response } from 'src/common/api-reponse/response-type';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
@ApiTags('Goal')
@Controller('goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        appraisalId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        description: { type: 'string' },
      },
    },
  })
  @Post()
  async createGoal(
    @Body() createGoalPayload: CreateGoalPayload,
  ): Promise<Response<Goal>> {
    const data = await this.goalService.createGoal(createGoalPayload);
    return {
      statusCode: 201,
      message: 'Goal created successfully',
      data,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllGoals(@Request() request: Request): Promise<Response<Goal[]>> {
    console.log('request>> ', request['user']);

    const data = await this.goalService.getAllGoals();
    return {
      statusCode: 200,
      message: 'Goals fetched successfully',
      data,
    };
  }
  @Get(':goalId') async getGoalById(
    @Param('goalId') id: string,
  ): Promise<Response<Goal>> {
    const data = await this.goalService.getGoal(id);
    return {
      statusCode: 200,
      message: 'Goal fetched successfully',
      data,
    };
  }
}
