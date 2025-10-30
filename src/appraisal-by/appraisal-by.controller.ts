import { Controller, Post, Body } from '@nestjs/common';
import { AppraisalBy } from './appraisal-by.entity';
import { Response } from 'src/common/api-reponse/response-type';

import { AppraisalByService } from './appraisal-by.service';
import { CreateAppraisalByPayload } from './appraisal-by.dto';

@Controller('appraisal-by')
export class AppraisalByController {
  constructor(private readonly appraisalByService: AppraisalByService) {}

  @Post()
  async createAppraisalBy(
    @Body()
    createAppraisalByDto: CreateAppraisalByPayload,
  ): Promise<Response<AppraisalBy>> {
    const data =
      await this.appraisalByService.createAppraisalBy(createAppraisalByDto);
    return {
      statusCode: 201,
      message: 'Appraisal by created successfully',
      data,
    };
  }
}
