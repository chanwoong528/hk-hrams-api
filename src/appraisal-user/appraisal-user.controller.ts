import { Controller, Post, Body, Param, Query, Get } from '@nestjs/common';
import { AppraisalUser } from './appraisal-user.entity';
import { CreateAppraisalUserPayload } from './appraisal-user.dto';
import { AppraisalUserService } from './appraisal-user.service';
import { Response } from 'src/common/api-reponse/response-type';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('평가 대상자 (Appraisal User)')
@ApiBearerAuth('access-token')
@Controller('appraisal-user')
export class AppraisalUserController {
  constructor(private readonly appraisalUserService: AppraisalUserService) {}

  @ApiOperation({ summary: '평가 대상자 지정', description: '특정 평가에 대한 대상자(피평가자) 목록을 조건에 따라 일괄 지정/생성합니다.' })
  @ApiResponse({ status: 201, description: '평가 대상자 지정 성공' })
  @Post()
  async createAppraisalUser(
    @Body() createAppraisalUserPayload: CreateAppraisalUserPayload,
  ): Promise<Response<AppraisalUser[]>> {
    const data = await this.appraisalUserService.createAppraisalFilteredUsers(
      createAppraisalUserPayload,
    );
    return {
      statusCode: 201,
      message: 'Appraisal user created successfully',
      data,
    };
  }

  @ApiOperation({ summary: '평가별 피평가자 목록 조회', description: '특정 평가 ID에 속한 피평가자 목록을 페이지네이션 및 검색 조건으로 조회합니다.' })
  @ApiParam({ name: 'appraisalId', description: '조회할 평가 ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'keyword', required: false, description: '검색어' })
  @ApiQuery({ name: 'sortBy', required: false, description: '정렬 기준 (예: name, latest)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: '정렬 방향' })
  @ApiResponse({ status: 200, description: '피평가자 목록 조회 성공' })
  @Get(':appraisalId')
  async getAppraisalUsersByAppraisalId(
    @Param('appraisalId') appraisalId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<Response<{ list: AppraisalUser[]; total: number }>> {
    const data = await this.appraisalUserService.getAppraisalUsersByAppraisalId(
      appraisalId,
      page,
      limit,
      keyword,
      sortBy,
      sortOrder,
    );
    return {
      statusCode: 200,
      message: 'Appraisal users fetched successfully',
      data,
    };
  }
}
