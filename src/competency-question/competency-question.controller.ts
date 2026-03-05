import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CompetencyQuestionService } from './competency-question.service';
import { CreateCompetencyQuestionsDto } from './dto/create-competency-questions.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('competency-question')
export class CompetencyQuestionController {
  constructor(
    private readonly competencyQuestionService: CompetencyQuestionService,
  ) {}

  @Post('department')
  @UseGuards(AuthGuard)
  async createCompetencyQuestionsForDepartment(
    @Body() createCompetencyQuestionsDto: CreateCompetencyQuestionsDto,
    @Request() request: Request,
  ) {
    const { sub } = (await request['user']) as { sub: string };

    return this.competencyQuestionService.createQuestionsAndAssignToDepartment(
      sub,
      createCompetencyQuestionsDto,
    );
  }
}
