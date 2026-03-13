import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CompetencyAssessmentService } from './competency-assessment.service';
import { UpdateCompetencyAssessmentDto } from './dto/update-competency-assessment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('역량 평가 피드백 (Competency Assessment)')
@ApiBearerAuth('access-token')
@Controller('competency-assessment')
export class CompetencyAssessmentController {
  constructor(
    private readonly competencyAssessmentService: CompetencyAssessmentService,
  ) {}

  @ApiOperation({ summary: '피평가자별 역량 평가 조회', description: '특정 평가 대상자(피평가자)에 대한 역량 평가 내역을 조회합니다.' })
  @ApiParam({ name: 'appraisalUserId', description: '조회할 평가 대상자 ID' })
  @ApiResponse({ status: 200, description: '역량 평가 조회 성공' })
  @Get('user/:appraisalUserId')
  @UseGuards(AuthGuard)
  async getAssessments(@Param('appraisalUserId') appraisalUserId: string) {
    return this.competencyAssessmentService.getAssessmentsForUser(
      appraisalUserId,
    );
  }

  @ApiOperation({ summary: '역량 평가 수정', description: '기존의 역량 평가 결과를 수정합니다. (등급, 코멘트 등)' })
  @ApiParam({ name: 'assessmentId', description: '수정할 평가 ID' })
  @ApiResponse({ status: 200, description: '역량 평가 수정 성공' })
  @Patch(':assessmentId')
  @UseGuards(AuthGuard)
  async updateAssessment(
    @Param('assessmentId') assessmentId: string,
    @Body() dto: UpdateCompetencyAssessmentDto,
    @Request() request: Request,
  ) {
    const { sub } = (await request['user']) as { sub: string };
    return this.competencyAssessmentService.updateAssessment(
      assessmentId,
      sub,
      dto,
    );
  }
}
