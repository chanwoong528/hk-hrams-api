import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { PerformanceAppraisal } from './performance-appraisal.entity';
import { CreatePerformanceAppraisalPayload } from './performance-appraisal.dto';
import { Response } from 'src/common/api-reponse/response-type';
import { PerformanceAppraisalService } from './performance-appraisal.service';

@Controller('performance-appraisal')
export class PerformanceAppraisalController {
  constructor(
    private readonly performanceAppraisalService: PerformanceAppraisalService,
  ) {}

  @Get()
  async getAllPerformanceAppraisals(
    @Query('type') type: string = '',
    @Query('keyword') keyword?: string,
  ): Promise<
    Response<
      PerformanceAppraisal[] | { appraisalType: string; count: number }[]
    >
  > {
    if (type === 'distinct') {
      const data =
        await this.performanceAppraisalService.getAallCountByDistinctAppraisalType(
          keyword,
        );
      return {
        statusCode: 200,
        message:
          'Performance appraisals count by appraisal type fetched successfully',
        data,
      };
    }
    const data =
      await this.performanceAppraisalService.getAllPerformanceAppraisals();
    return {
      statusCode: 200,
      message: 'Performance appraisals fetched successfully',
      data,
    };
  }

  @Get(':appraisalType')
  async getAllPerformanceAppraisalsByType(
    @Param('appraisalType') appraisalType: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('keyword') keyword?: string,
  ): Promise<Response<{ list: PerformanceAppraisal[]; total: number }>> {
    const data =
      await this.performanceAppraisalService.getAllPerformanceAppraisalByType(
        appraisalType,
        page,
        limit,
        keyword,
      );
    return {
      statusCode: 200,
      message: `Performance appraisals by type fetched successfully appraisalType: ${appraisalType}`,
      data,
    };
  }

  // @Get('/distinct-appraisal-types')
  // async getAallCountByDistinctAppraisalType(
  //   @Query('keyword') keyword?: string, // @Query('keyword') keyword?: string,
  // ): Promise<Response<{ appraisalType: string; count: number }[]>> {
  //   // console.log('keyword', keyword);
  //   const data = await this.performanceAppraisalService
  //     .getAallCountByDistinctAppraisalType
  //     // keyword,
  //     ();
  //   return {
  //     statusCode: 200,
  //     message:
  //       'Performance appraisals count by appraisal type fetched successfully11111',
  //     data,
  //   };
  // }

  @Post()
  async createPerformanceAppraisal(
    @Body()
    createPerformanceAppraisalPayload: CreatePerformanceAppraisalPayload,
  ): Promise<Response<PerformanceAppraisal[]>> {
    const data =
      await this.performanceAppraisalService.createPerformanceAppraisal(
        createPerformanceAppraisalPayload,
      );
    return {
      statusCode: 201,
      message: 'Performance appraisal created successfully',
      data,
    };
  }
}
