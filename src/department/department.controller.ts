import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Department } from './department.entity';
import { Response } from 'src/common/api-reponse/response-type';
import {
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from './department.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('부서 (Department)')
@ApiBearerAuth('access-token')
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @ApiOperation({ summary: '부서 목록 조회', description: '전체 부서 목록을 조회합니다 (트리형 또는 평면형).' })
  @ApiQuery({ name: 'viewType', required: false, enum: ['flat', 'tree'], description: '응답 형태 (기본값: tree)' })
  @ApiResponse({ status: 200, description: '부서 목록 조회 성공' })
  @Get()
  @UseGuards(AuthGuard)
  async getAllDepartments(
    @Query('viewType') viewType: 'flat' | 'tree' = 'tree',
  ): Promise<Response<Department[]>> {
    const data =
      viewType === 'flat'
        ? await this.departmentService.getAllDepartmentsFlat()
        : await this.departmentService.getAllDepartments();
    return {
      statusCode: 200,
      message: 'Root departments fetched successfully',
      data,
    };
  }

  @ApiOperation({ summary: '부서 생성', description: '새로운 부서를 생성합니다.' })
  @ApiResponse({ status: 201, description: '부서 생성 성공' })
  @Post()
  async createDepartment(
    @Body() createDepartmentPayload: CreateDepartmentPayload,
  ): Promise<Response<Department>> {
    const data = await this.departmentService.createDepartment(
      createDepartmentPayload,
    );
    return {
      statusCode: 201,
      message: 'Department created successfully',
      data,
    };
  }

  @ApiOperation({ summary: '부서 정보 수정', description: '특정 부서의 정보를 수정합니다.' })
  @ApiParam({ name: 'id', description: '수정할 부서 ID' })
  @ApiResponse({ status: 200, description: '부서 수정 성공' })
  @Patch(':id')
  async updateDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentPayload: UpdateDepartmentPayload,
  ): Promise<Response<Department>> {
    const data = await this.departmentService.updateDepartment(
      id,
      updateDepartmentPayload,
    );
    return {
      statusCode: 200,
      message: 'Department updated successfully',
      data,
    };
  }

  //TODO: update many departments
  // @Patch()
  // async updateManyDepartments(
  //   @Body() updateManyDepartmentsPayload: UpdateManyDepartmentsPayload[],
  // ): Promise<Response<Department[]>> {}
}
