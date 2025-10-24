import { Controller, Post, Body } from '@nestjs/common';
import { PerformanceAppraisalBy } from './performance-appraisal-by.entity';
import { Response } from 'src/common/api-reponse/response-type';

import { PerformanceAppraisalByService } from './performance-appraisal-by.service';
import { CreatePerformanceAppraisalByPayload } from './performance-appraisal-by.dto';

@Controller('performance-appraisal-by')
export class PerformanceAppraisalByController {
  constructor(
    private readonly performanceAppraisalByService: PerformanceAppraisalByService,
  ) {}

  @Post()
  async createPerformanceAppraisalBy(
    @Body()
    createPerformanceAppraisalByDto: CreatePerformanceAppraisalByPayload,
  ): Promise<Response<PerformanceAppraisalBy>> {
    const data =
      await this.performanceAppraisalByService.createPerformanceAppraisalBy(
        createPerformanceAppraisalByDto,
      );
    return {
      statusCode: 201,
      message: 'Performance appraisal by created successfully',
      data,
    };
  }
}
