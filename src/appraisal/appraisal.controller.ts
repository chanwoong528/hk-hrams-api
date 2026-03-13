import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Request,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { Appraisal } from './appraisal.entity';
import {
  CreateAppraisalPayload,
  UpdateAppraisalPayload,
} from './appraisal.dto';
import { Response } from 'src/common/api-reponse/response-type';
import { AppraisalService } from './appraisal.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('평가 (Appraisal)')
@ApiBearerAuth('access-token')
@Controller()
export class AppraisalController {
  constructor(private readonly appraisalService: AppraisalService) { }

  @ApiOperation({ summary: '전체 평가 목록 조회', description: '조건에 따른 평가 목록을 조회합니다. (type: distinct, my-appraisal 등)' })
  @ApiQuery({ name: 'type', required: false, description: '조회 타입 (distinct: 종류별 개수, my-appraisal: 내 평가)' })
  @ApiResponse({ status: 200, description: '평가 목록 조회 성공' })
  @Get('appraisal')
  @UseGuards(AuthGuard)
  async getAllAppraisals(
    @Query('type') type: string = '',
    // @Query('keyword') keyword?: string,
    @Request() request: Request,
  ): Promise<
    Response<Appraisal[] | { appraisalType: string; count: number }[]>
  > {
    if (type === 'distinct') {
      const data = await this.appraisalService.getAllAppraisals();
      return {
        statusCode: 200,
        message: 'Appraisals count by appraisal type fetched successfully',
        data,
      };
    }

    if (type === 'my-appraisal') {
      const { sub } = (await request['user']) as { sub: string };
      console.log('sub>> ', sub);

      const data = await this.appraisalService.getMyAppraisal(sub);
      return {
        statusCode: 200,
        message: 'My appraisal fetched successfully',
        data,
      };
    }

    const data = await this.appraisalService.getAllAppraisals();
    return {
      statusCode: 200,
      message: 'Appraisals fetched successfully',
      data,
    };
  }

  @ApiOperation({ summary: '특정 평가 종류로 목록 조회', description: 'appraisalId(혹은 평가 종류) 기준으로 평가 목록을 페이지네이션하여 조회합니다.' })
  @ApiParam({ name: 'appraisalId', description: '조회할 평가 ID (또는 종류)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'keyword', required: false, description: '검색어' })
  @ApiResponse({ status: 200, description: '조건부 평가 목록 조회 성공' })
  @Get('appraisal/:appraisalId')
  async getAllAppraisalsByType(
    @Param('appraisalId') appraisalId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('keyword') keyword?: string,
  ): Promise<Response<{ list: Appraisal[]; total: number }>> {
    const data = await this.appraisalService.getAllAppraisalById(
      appraisalId,
      page,
      limit,
      keyword,
    );
    return {
      statusCode: 200,
      message: `Appraisals by type fetched successfully appraisalType: ${appraisalId}`,
      data,
    };
  }

  @ApiOperation({ summary: '평가 팀원 목록 조회', description: '주어진 부서 ID 목록을 기반으로 평가 대상 팀원들을 조회합니다.' })
  @ApiQuery({ name: 'departments', required: true, description: '부서 ID 쉼표(,) 구분 문자열' })
  @ApiResponse({ status: 200, description: '평가 대상 팀원 조회 성공' })
  @Get('appraisal-team-members')
  @UseGuards(AuthGuard)
  async getAppraisalTeamMembers(
    @Query('departments') departments: string,
    @Request() request: Request,
  ): Promise<Response<any>> {
    const { sub } = (await request['user']) as { sub: string };
    const ids = departments ? departments.split(',').filter(id => id.trim() !== '') : [];

    if (ids.length === 0) {
      return {
        statusCode: 200,
        message: 'No departments provided',
        data: [],
      };
    }

    const data = await this.appraisalService.getAppraisalTeamMembers(ids, sub);

    console.log('data>>> ', data);
    return {
      statusCode: 200,
      message: 'Appraisal team members fetched successfully',
      data: data,
    };
  }

  @ApiOperation({ summary: '새 평가 생성', description: '새로운 평가(Appraisal)를 생성합니다. (리더 전용 등에 유의)' })
  @ApiResponse({ status: 201, description: '평가 생성 성공' })
  @Post('appraisal')
  @UseGuards(AuthGuard)
  async createAppraisal(
    @Body()
    createAppraisalPayload: CreateAppraisalPayload,
    @Request() request: Request,
  ): Promise<Response<Appraisal>> {
    const { sub } = (await request['user']) as { sub: string };
    const data = await this.appraisalService.createAppraisal(
      createAppraisalPayload,
      sub,
    );

    return {
      statusCode: 201,
      message: 'Appraisal created successfully',
      data,
    };
  }

  @ApiOperation({ summary: '평가 수정', description: '기존 평가 정보를 수정합니다.' })
  @ApiParam({ name: 'appraisalId', description: '수정할 평가 ID' })
  @ApiResponse({ status: 200, description: '평가 수정 성공' })
  @Patch('appraisal/:appraisalId')
  async updateAppraisal(
    @Param('appraisalId') appraisalId: string,
    @Body() updateAppraisalPayload: UpdateAppraisalPayload,
  ): Promise<Response<Appraisal>> {
    console.log('updateAppraisalPayload>>> ', updateAppraisalPayload);

    const data = await this.appraisalService.updateAppraisal(
      appraisalId,
      updateAppraisalPayload,
    );

    return {
      statusCode: 200,
      message: 'Appraisal updated successfully',
      data,
    };
  }

  @ApiOperation({ summary: '평가 삭제', description: '평가를 삭제합니다.' })
  @ApiParam({ name: 'appraisalId', description: '삭제할 평가 ID' })
  @ApiResponse({ status: 200, description: '평가 삭제 성공' })
  @Delete('appraisal/:appraisalId')
  async deleteAppraisal(
    @Param('appraisalId') appraisalId: string,
  ): Promise<Response<void>> {
    await this.appraisalService.deleteAppraisal(appraisalId);
    return {
      statusCode: 200,
      message: 'Appraisal deleted successfully',
      data: null,
    };
  }
}
