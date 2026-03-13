import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { HramsUserService } from './hrams-user.service';
import { HramsUser } from './hrams-user.entity';
import { Response } from 'src/common/api-reponse/response-type';
import {
  CreateHramsUserPayload,
  CreateBulkHramsUserPayload,
  HramsUserWithDepartments,
  UpdateHramsUserPayload,
} from './hrams-user.dto';

import { CustomException } from 'src/common/exceptions/custom-exception';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('사용자 (User)')
@ApiBearerAuth('access-token')
@Controller('user')
export class HramsUserController {
  private readonly customException = new CustomException('HramsUser');
  constructor(private readonly hrUserService: HramsUserService) { }

  @ApiOperation({ summary: '사용자 목록 조회', description: '전체 사용자 목록을 페이지네이션 및 검색 조건과 함께 조회합니다.' })
  @ApiQuery({ name: 'keyword', required: false, description: '검색어 (이름 또는 이메일)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본값: 10)' })
  @ApiQuery({ name: 'departmentId', required: false, description: '부서 ID로 필터링' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공' })
  @Get()
  @UseGuards(AuthGuard)
  async getAllHramsUsers(
    @Query('keyword') keyword: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('departmentId') departmentId?: string,
  ): Promise<Response<{ list: HramsUserWithDepartments[]; total: number }>> {
    const data = await this.hrUserService.getAllHramsUsersByPagination(
      page,
      limit,
      keyword,
      departmentId,
    );

    return {
      statusCode: 200,
      message: 'Hrams users fetched successfully',
      data: data,
    };
  }

  @ApiOperation({ summary: '리더 목록 조회', description: '부서장(리더) 권한을 가진 사용자 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '리더 목록 조회 성공' })
  @Get('leaders')
  @UseGuards(AuthGuard)
  async getAllLeaders() {
    const data = await this.hrUserService.getAllLeaders();
    return {
      statusCode: 200,
      message: 'Leaders fetched successfully',
      data,
    };
  }

  @ApiOperation({ summary: '단일 사용자 생성', description: '새로운 사용자를 생성합니다.' })
  @ApiResponse({ status: 201, description: '사용자 생성 성공' })
  @Post()
  // @UseGuards(AuthGuard)
  async createHramsUser(
    @Body() createHramsUserPayload: CreateHramsUserPayload,
  ): Promise<Response<HramsUser>> {
    const data = await this.hrUserService.createHramsUser(
      createHramsUserPayload,
    );
    return {
      statusCode: 201,
      message: 'Hrams user created successfully',
      data,
    };
  }

  @ApiOperation({ summary: '사용자 일괄 생성', description: '여러 사용자를 한 번에 생성합니다.' })
  @ApiResponse({ status: 201, description: '사용자 일괄 생성 성공' })
  @Post('bulk')
  async createBulkHramsUsers(
    @Body() createBulkPayload: CreateBulkHramsUserPayload,
  ): Promise<Response<HramsUser[]>> {
    const data = await this.hrUserService.createBulkHramsUsers(
      createBulkPayload.users,
    );
    return {
      statusCode: 201,
      message: 'Bulk hrams users created successfully',
      data,
    };
  }

  @ApiOperation({ summary: '사용자 정보 수정', description: '특정 사용자의 정보를 수정합니다.' })
  @ApiParam({ name: 'userId', description: '수정할 사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 정보 수정 성공' })
  @Patch(':userId')
  async updateHramsUserById(
    @Param('userId') userId: string,
    @Body() updateHramsUserPayload: UpdateHramsUserPayload,
  ): Promise<Response<HramsUser>> {
    const data = await this.hrUserService.updateHramsUserById(
      userId,
      updateHramsUserPayload,
    );
    return {
      statusCode: 200,
      message: `Hrams user updated successfully userId: ${userId}`,
      data,
    };
  }

  @ApiOperation({ summary: '데모 사용자 일괄 생성', description: '테스트용 가상 사용자 데이터를 일괄 생성합니다.' })
  @ApiResponse({ status: 201, description: '데모 사용자 생성 성공' })
  @Post('demo-bulk')
  async createDemoBulkHramsUsers(): Promise<Response<HramsUser[]>> {
    const data = await this.hrUserService.createDemoBulkHramsUsers();
    return {
      statusCode: 201,
      message: 'Demo bulk hrams users created successfully',
      data,
    };
  }
}
