import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EvaluationReportService } from './evaluation-report.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('evaluation-report')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('evaluation-report')
export class EvaluationReportController {
    constructor(private readonly reportService: EvaluationReportService) { }

    @Get(':appraisalUserId')
    @ApiOperation({ summary: 'Get combined evaluation report for an appraisal user' })
    async getReport(@Param('appraisalUserId') appraisalUserId: string) {
        return await this.reportService.getReport(appraisalUserId);
    }
}
