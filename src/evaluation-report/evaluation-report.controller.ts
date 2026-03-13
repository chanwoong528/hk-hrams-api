import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EvaluationReportService } from './evaluation-report.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('평가 리포트 (Evaluation Report)')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('evaluation-report')
export class EvaluationReportController {
    constructor(private readonly reportService: EvaluationReportService) { }

    @Get(':appraisalUserId')
    @ApiOperation({ summary: '개인별 종합 평가 리포트 조회', description: '특정 평가 대상자(피평가자)의 목표 달성, 역량 평가, 리더 평가 등 모든 평가 결과를 종합한 리포트를 조회합니다.' })
    @ApiParam({ name: 'appraisalUserId', description: '조회할 평가 대상자(Appraisal User) ID' })
    @ApiResponse({ status: 200, description: '평가 리포트 조회 성공' })
    async getReport(@Param('appraisalUserId') appraisalUserId: string) {
        return await this.reportService.getReport(appraisalUserId);
    }
}
