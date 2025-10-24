import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { HramsUserService } from './hrams-user.service';
import { HramsUser } from './hrams-user.entity';
import { Response } from 'src/common/api-reponse/response-type';
import {
  CreateHramsUserPayload,
  HramsUserWithDepartments,
} from './hrams-user.dto';

import { CustomException } from 'src/common/exceptions/custom-exception';

@Controller('user')
export class HramsUserController {
  private readonly customException = new CustomException('HramsUser');
  constructor(private readonly hrUserService: HramsUserService) {}

  @Get() async getAllHramsUsers(
    @Query('keyword') keyword: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<
    Response<{ list: HramsUserWithDepartments[]; total: number } | HramsUser[]>
  > {
    if (!keyword) {
      const data = await this.hrUserService.getAllHramsUsersByPagination(
        page,
        limit,
      );

      return {
        statusCode: 200,
        message: 'Hrams users fetched by pagination successfully',
        data: data,
      };
    }

    const data = await this.hrUserService.getAllHramsUsersByKeyword(keyword);
    return {
      statusCode: 200,
      message: `Hrams users fetched by keyword successfully keywrod: ${keyword}`,
      data,
    };
  }

  @Post()
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
}
