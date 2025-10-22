import { Controller, Post, Body, Param, Get } from '@nestjs/common';

import { HramsUserDepartment } from './hrams-user-department.entity';
import { CreateHramsUserDepartmentPayload } from './hrams-user-department.dto';
import { HramsUserDepartmentService } from './hrams-user-department.service';

import { Response } from 'src/common/api-reponse/response-type';
import { Department } from 'src/department/department.entity';

@Controller('user-department')
export class HramsUserDepartmentController {
  constructor(
    private readonly hramsUserDepartmentService: HramsUserDepartmentService,
  ) {}
  @Post()
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

  @Get(':userId')
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
