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

@Controller('competency-assessment')
export class CompetencyAssessmentController {
  constructor(
    private readonly competencyAssessmentService: CompetencyAssessmentService,
  ) {}

  @Get('user/:appraisalUserId')
  @UseGuards(AuthGuard)
  async getAssessments(@Param('appraisalUserId') appraisalUserId: string) {
    return this.competencyAssessmentService.getAssessmentsForUser(
      appraisalUserId,
    );
  }

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
