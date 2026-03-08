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
@Controller('user')
export class HramsUserController {
  private readonly customException = new CustomException('HramsUser');
  constructor(private readonly hrUserService: HramsUserService) { }

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
