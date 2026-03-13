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
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('목표 (Goal)')
@ApiBearerAuth('access-token')
@Controller()
export class GoalController {
  constructor(private readonly goalService: GoalService) { }

  @ApiOperation({ summary: '개인 목표 생성', description: '로그인한 사용자의 개인 목표를 생성합니다.' })
  @ApiResponse({ status: 201, description: '목표 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
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

  @ApiOperation({ summary: '공통 목표 생성', description: '리더 사용자가 특정 부서 인원들을 위한 공통 목표를 생성합니다.' })
  @ApiResponse({ status: 201, description: '공통 목표 생성 성공' })
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
  }

  @ApiOperation({ summary: '공통 목표 수정', description: '리더 사용자가 특정 부서의 공통 목표를 수정합니다.' })
  @ApiResponse({ status: 200, description: '공통 목표 수정 성공' })
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

  @ApiOperation({ summary: '공통 목표 삭제', description: '리더 사용자가 특정 부서의 공통 목표를 삭제합니다.' })
  @ApiResponse({ status: 200, description: '공통 목표 삭제 성공' })
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

  @ApiOperation({ summary: '전체 목표 목록 조회', description: '시스템에 등록된 모든 목표 항목을 조회합니다.' })
  @ApiResponse({ status: 200, description: '전체 목표 조회 성공' })
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

  @ApiOperation({ summary: '단일 목표 조회', description: '특정 ID의 목표 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'goalId', description: '조회할 목표 ID' })
  @ApiResponse({ status: 200, description: '단일 목표 조회 성공' })
  @Get('goal/:goalId') 
  async getGoalById(
    @Param('goalId') id: string,
  ): Promise<Response<Goal>> {
    const data = await this.goalService.getGoal(id);
    return {
      statusCode: 200,
      message: 'Goal fetched successfully',
      data,
    };
  }

  @ApiOperation({ summary: '평가별 내 목표 조회', description: '특정 평가 ID에 속한 로그인 사용자의 목표 목록을 조회합니다.' })
  @ApiParam({ name: 'appraisalId', description: '조회할 평가 ID' })
  @ApiResponse({ status: 200, description: '평가별 목표 조회 성공' })
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

  @ApiOperation({ summary: '목표 수정', description: '기존 목표의 제목과 설명을 수정합니다.' })
  @ApiParam({ name: 'goalId', description: '수정할 목표 ID' })
  @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: '목표 수정 성공' })
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

  @ApiOperation({ summary: '목표 삭제', description: '특정 목표를 삭제합니다.' })
  @ApiParam({ name: 'goalId', description: '삭제할 목표 ID' })
  @ApiResponse({ status: 200, description: '목표 삭제 성공' })
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
