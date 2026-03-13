import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { CompetencyQuestionService } from './competency-question.service';
import { CreateCompetencyQuestionsDto } from './dto/create-competency-questions.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('역량 평가 질문 (Competency Question)')
@ApiBearerAuth('access-token')
@Controller('competency-question')
export class CompetencyQuestionController {
  constructor(
    private readonly competencyQuestionService: CompetencyQuestionService,
  ) { }

  @ApiOperation({ summary: '부서별 역량 평가 질문 생성', description: '리더가 특정 부서 인원들을 위한 역량 평가 질문 목록을 생성하고 할당합니다.' })
  @ApiResponse({ status: 201, description: '질문 생성 및 할당 성공' })
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

  @ApiOperation({ summary: '내 평가 질문 조회', description: '로그인한 사용자에게 할당된 역량 평가 질문 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '질문 목록 조회 성공' })
  @Get()
  @UseGuards(AuthGuard)
  async getCompetencyQuestions(@Request() request: Request) {
    const { sub: userId } = (await request['user']) as { sub: string };
    const result = await this.competencyQuestionService.getQuestions(userId);

    return {
      statusCode: 200,
      message: 'Competency questions fetched successfully',
      data: result,
    };
  }
}
