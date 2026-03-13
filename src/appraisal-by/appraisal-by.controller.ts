import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AppraisalBy } from './appraisal-by.entity';
import { Response } from 'src/common/api-reponse/response-type';

import { AppraisalByService } from './appraisal-by.service';
import { CreateAppraisalByPayload } from './appraisal-by.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('평가 피드백 (Appraisal By)')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('appraisal-by')
export class AppraisalByController {
  constructor(private readonly appraisalByService: AppraisalByService) {}

  @ApiOperation({ summary: '평가 결과/피드백 제출', description: '평가자가 피평가자에 대한 평가 등급 및 코멘트를 제출합니다.' })
  @ApiResponse({ status: 201, description: '평가 결과 제출 성공' })
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
