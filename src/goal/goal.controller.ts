import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  CreateCommonGoalPayload,
  CreateGoalPayload,
  UpdateCommonGoalPayload,
  DeleteCommonGoalPayload,
} from './goal.dto';
import { GoalService } from './goal.service';
import { Goal } from './goal.entity';
import { Response } from 'src/common/api-reponse/response-type';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
@ApiTags('Goal')
@Controller()
export class GoalController {
  constructor(private readonly goalService: GoalService) { }

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
  @Post('goal')
  @UseGuards(AuthGuard)
  async createGoal(
    @Body() createGoalPayload: CreateGoalPayload,
    @Request() request: Request,
  ): Promise<Response<Goal[]>> {
    const { sub } = (await request['user']) as { sub: string };

    const data = await this.goalService.createGoal(createGoalPayload, sub);
    return {
      statusCode: 201,
      message: 'Goals created successfully',
      data,
    };
  }
  @Post('common-goal')
  @UseGuards(AuthGuard)
  async createCommonGoal(
    @Body() createCommonGoalPayload: CreateCommonGoalPayload,
    @Request() request: Request,
  ): Promise<Response<Goal[]>> {
    const { sub } = (await request['user']) as { sub: string };

    console.log('sub>> ', sub);

    const data = await this.goalService.createCommonGoalByLeader(
      createCommonGoalPayload,
      sub,
    );

    return {
      statusCode: 201,
      message: 'Common goal created successfully',
      data: data,
    };

    // return {
    //   statusCode: 201,
    //   message: 'Common goal created successfully',
    //   data,
    // };
  }

  @Patch('common-goal')
  @UseGuards(AuthGuard)
  async updateCommonGoal(
    @Body() updateCommonGoalPayload: UpdateCommonGoalPayload,
    @Request() request: Request,
  ): Promise<Response<Goal[]>> {
    const { sub } = (await request['user']) as { sub: string };

    const data = await this.goalService.updateCommonGoalByLeader(
      updateCommonGoalPayload,
      sub,
    );

    return {
      statusCode: 200,
      message: 'Common goal updated successfully',
      data: data,
    };
  }

  @Delete('common-goal')
  @UseGuards(AuthGuard)
  async deleteCommonGoalByLeader(
    @Body() payload: DeleteCommonGoalPayload,
    @Request() request: Request,
  ) {
    const { sub } = (await request['user']) as { sub: string };
    const data = await this.goalService.deleteCommonGoalByLeader(sub, payload);
    return {
      statusCode: 200,
      message: 'Common goal deleted successfully',
      data: data,
    };
  }

  @Get('goal')
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
  @Get('goal/:goalId') async getGoalById(
    @Param('goalId') id: string,
  ): Promise<Response<Goal>> {
    const data = await this.goalService.getGoal(id);
    return {
      statusCode: 200,
      message: 'Goal fetched successfully',
      data,
    };
  }

  @Get('goal/appraisal/:appraisalId')
  @UseGuards(AuthGuard)
  async getGoalByUserIdAndAppraisalId(
    @Param('appraisalId') appraisalId: string,
    @Request() request: Request,
  ): Promise<Response<Goal[]>> {
    const { sub: userId } = (await request['user']) as { sub: string };
    const data = await this.goalService.getGoalByUserIdAndAppraisalId(
      userId,
      appraisalId,
    );
    return {
      statusCode: 200,
      message: 'Goals fetched successfully',
      data,
    };
  }
  @Patch('goal/:goalId')
  @UseGuards(AuthGuard)
  async updateGoal(
    @Param('goalId') goalId: string,
    @Body() payload: { title: string; description: string },
    @Request() request: Request,
  ): Promise<Response<Goal>> {
    const { sub: userId } = (await request['user']) as { sub: string };
    const data = await this.goalService.updateGoal(goalId, userId, payload);
    return {
      statusCode: 200,
      message: 'Goal updated successfully',
      data,
    };
  }

  @Delete('goal/:goalId')
  @UseGuards(AuthGuard)
  async deleteGoal(
    @Param('goalId') goalId: string,
    @Request() request: Request,
  ) {
    const { sub: userId } = (await request['user']) as { sub: string };
    const data = await this.goalService.deleteGoal(goalId, userId);
    return {
      statusCode: 200,
      message: 'Goal deleted successfully',
      data,
    };
  }
}
