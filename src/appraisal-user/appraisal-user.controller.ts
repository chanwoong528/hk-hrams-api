import { Controller, Post, Body, Param, Query, Get } from '@nestjs/common';
import { AppraisalUser } from './appraisal-user.entity';
import { CreateAppraisalUserPayload } from './appraisal-user.dto';
import { AppraisalUserService } from './appraisal-user.service';
import { Response } from 'src/common/api-reponse/response-type';

@Controller('appraisal-user')
export class AppraisalUserController {
  constructor(private readonly appraisalUserService: AppraisalUserService) {}

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

  @Get(':appraisalId')
  async getAppraisalUsersByAppraisalId(
    @Param('appraisalId') appraisalId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('keyword') keyword?: string,
  ): Promise<Response<{ list: AppraisalUser[]; total: number }>> {
    const data = await this.appraisalUserService.getAppraisalUsersByAppraisalId(
      appraisalId,
      page,
      limit,
      keyword,
    );
    return {
      statusCode: 200,
      message: 'Appraisal users fetched successfully',
      data,
    };
  }
}
