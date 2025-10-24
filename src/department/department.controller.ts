import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Department } from './department.entity';
import { Response } from 'src/common/api-reponse/response-type';
import {
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  // UpdateManyDepartmentsPayload,
} from './department.dto';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
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
