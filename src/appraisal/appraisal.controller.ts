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
} from '@nestjs/common';
import { Appraisal } from './appraisal.entity';
import {
  CreateAppraisalPayload,
  UpdateAppraisalPayload,
} from './appraisal.dto';
import { Response } from 'src/common/api-reponse/response-type';
import { AppraisalService } from './appraisal.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller()
export class AppraisalController {
  constructor(private readonly appraisalService: AppraisalService) {}

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
  @Get('appraisal-team-members')
  @UseGuards(AuthGuard)
  async getAppraisalTeamMembers(
    @Query('departments') departments: string,
    @Request() request: Request,
  ): Promise<Response<FormattedAppraisalResponse>> {
    const { sub } = (await request['user']) as { sub: string };
    const ids = departments.split(',');
    const data = await this.appraisalService.getAppraisalTeamMembers(ids, sub);

    console.log('data>>> ', data);
    return {
      statusCode: 200,
      message: 'Appraisal team members fetched successfully',
      data: data,
    };
  }
  @Post('appraisal')
  async createAppraisal(
    @Body()
    createAppraisalPayload: CreateAppraisalPayload,
  ): Promise<Response<Appraisal>> {
    const data = await this.appraisalService.createAppraisal(
      createAppraisalPayload,
    );

    return {
      statusCode: 201,
      message: 'Appraisal created successfully',
      data,
    };
  }

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
}
