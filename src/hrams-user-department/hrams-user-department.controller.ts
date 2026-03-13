import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';

import { HramsUserDepartment } from './hrams-user-department.entity';
import { CreateHramsUserDepartmentPayload } from './hrams-user-department.dto';
import { HramsUserDepartmentService } from './hrams-user-department.service';

import { Response } from 'src/common/api-reponse/response-type';
import { Department } from 'src/department/department.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('사용자-부서 매핑 (User Department)')
@ApiBearerAuth('access-token')
@Controller('user-department')
export class HramsUserDepartmentController {
  constructor(
    private readonly hramsUserDepartmentService: HramsUserDepartmentService,
  ) {}

  @ApiOperation({ summary: '사용자-부서 매핑 생성 및 업데이트', description: '사용자를 특정 부서에 매핑하거나, 기존 매핑 정보를 업데이트(Upsert)합니다.' })
  @ApiResponse({ status: 201, description: '매핑 생성/업데이트 성공' })
  @Post()
  @UseGuards(AuthGuard)
  async createHramsUserDepartment(
    @Body() createHramsUserDepartmentPayload: CreateHramsUserDepartmentPayload,
  ): Promise<Response<HramsUserDepartment>> {
    const data =
      await this.hramsUserDepartmentService.upsertHramsUserDepartment(
        createHramsUserDepartmentPayload,
      );
    return {
      statusCode: 201,
      message: 'Hrams user department upserted successfully',
      data,
    };
  }

  @ApiOperation({ summary: '사용자별 속한 부서 목록 조회', description: '특정 사용자가 속해있는 모든 부서 목록을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '조회할 사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 소속 부서 조회 성공' })
  @Get(':userId')
  @UseGuards(AuthGuard)
  async getHramsUserDepartments(
    @Param('userId') userId: string,
  ): Promise<Response<Department[]>> {
    const data =
      await this.hramsUserDepartmentService.getHramsUserDepartmentsByUserId(
        userId,
      );
    return {
      statusCode: 200,
      message: "Hrams user's departments fetched successfully",
      data: data.map((hramsUserDepartment) => hramsUserDepartment.department),
    };
  }
}
