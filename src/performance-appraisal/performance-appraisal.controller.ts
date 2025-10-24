import { Controller, Post, Body, Get } from '@nestjs/common';
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
  async getAllPerformanceAppraisals(): Promise<
    Response<PerformanceAppraisal[]>
  > {
    const data =
      await this.performanceAppraisalService.getAllPerformanceAppraisals();
    return {
      statusCode: 200,
      message: 'Performance appraisals fetched successfully',
      data,
    };
  }

  @Post()
  async createPerformanceAppraisal(
    @Body()
    createPerformanceAppraisalPayload: CreatePerformanceAppraisalPayload,
  ): Promise<Response<PerformanceAppraisal>> {
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
