import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { Appraisal } from './appraisal.entity';
import {
  CreateAppraisalPayload,
  UpdateAppraisalPayload,
} from './appraisal.dto';
import { Response } from 'src/common/api-reponse/response-type';
import { AppraisalService } from './appraisal.service';

@Controller('appraisal')
export class AppraisalController {
  constructor(private readonly appraisalService: AppraisalService) {}

  @Get()
  async getAllAppraisals(
    @Query('type') type: string = '',
    // @Query('keyword') keyword?: string,
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
    const data = await this.appraisalService.getAllAppraisals();
    return {
      statusCode: 200,
      message: 'Appraisals fetched successfully',
      data,
    };
  }

  @Get(':appraisalId')
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

  // @Get('/distinct-appraisal-types')
  // async getAallCountByDistinctAppraisalType(
  //   @Query('keyword') keyword?: string, // @Query('keyword') keyword?: string,
  // ): Promise<Response<{ appraisalType: string; count: number }[]>> {
  //   // console.log('keyword', keyword);
  //   const data = await this.appraisalService
  //     .getAallCountByDistinctAppraisalType
  //     // keyword,
  //     ();
  //   return {
  //     statusCode: 200,
  //     message:
  //       'Appraisals count by appraisal type fetched successfully11111',
  //     data,
  //   };
  // }

  @Post()
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

  @Patch(':appraisalId')
  async updateAppraisal(
    @Param('appraisalId') appraisalId: string,
    @Body() updateAppraisalPayload: UpdateAppraisalPayload,
  ): Promise<Response<Appraisal>> {
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
