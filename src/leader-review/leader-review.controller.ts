import { Body, Controller, Get, Param, Post, Put, UseGuards, Request } from '@nestjs/common';
import { LeaderReviewService } from './leader-review.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiProperty } from '@nestjs/swagger';

class SubmitAssignmentAnswersDto {
  @ApiProperty({ description: '질문 ID' })
  questionId: string;
  @ApiProperty({ description: '답변 내용' })
  answer: string;
}

class SubmitAssignmentDto {
  @ApiProperty({ type: [SubmitAssignmentAnswersDto], description: '제출할 답변 목록' })
  answers: SubmitAssignmentAnswersDto[];
}

@ApiTags('리더 평가 (Leader Review)')
@ApiBearerAuth('access-token')
@Controller('leader-review')
export class LeaderReviewController {
  constructor(private readonly leaderReviewService: LeaderReviewService) { }

  @ApiOperation({ summary: '글로벌 템플릿 생성', description: '새로운 리더 평가 글로벌 템플릿을 생성합니다.' })
  @ApiResponse({ status: 201, description: '템플릿 생성 성공' })
  @Post('templates')
  @UseGuards(AuthGuard)
  async createTemplate(@Body() body: any) {
    return this.leaderReviewService.createGlobalTemplate(body);
  }

  @ApiOperation({ summary: '전체 글로벌 템플릿 목록 조회', description: '등록된 모든 리더 평가 글로벌 템플릿을 조회합니다.' })
  @ApiResponse({ status: 200, description: '템플릿 목록 조회 성공' })
  @Get('templates')
  @UseGuards(AuthGuard)
  async getTemplates() {
    return this.leaderReviewService.getAllGlobalTemplates();
  }

  @ApiOperation({ summary: '단일 글로벌 템플릿 상세 조회', description: 'ID를 기반으로 특정 글로벌 템플릿의 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'templateId', description: '조회할 템플릿 ID' })
  @ApiResponse({ status: 200, description: '템플릿 상세 조회 성공' })
  @Get('templates/:templateId')
  @UseGuards(AuthGuard)
  async getTemplate(@Param('templateId') templateId: string) {
    return this.leaderReviewService.getTemplate(templateId);
  }

  @ApiOperation({ summary: '글로벌 템플릿 수정', description: '특정 글로벌 템플릿의 정보를 수정합니다.' })
  @ApiParam({ name: 'templateId', description: '수정할 템플릿 ID' })
  @ApiResponse({ status: 200, description: '템플릿 수정 성공' })
  @Put('templates/:templateId')
  @UseGuards(AuthGuard)
  async updateTemplate(@Param('templateId') templateId: string, @Body() body: any) {
    return this.leaderReviewService.updateTemplate(templateId, body);
  }

  @ApiOperation({ summary: '리더 평가 배포(시작)', description: '템플릿을 기반으로 전체 구성원(제외 인원 제외)에게 리더 평가를 배포합니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        templateId: { type: 'string', description: '사용할 템플릿 ID' },
        reviewTitle: { type: 'string', description: '리더 평가 제목' },
        reviewDescription: { type: 'string', description: '리더 평가 설명 (선택)' },
        excludedUserIds: { type: 'array', items: { type: 'string' }, description: '평가에서 제외할 사용자 ID 목록 (선택)' },
        deadline: { type: 'string', format: 'date-time', description: '제출 마감 일시 (선택)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: '리더 평가 배포 성공' })
  @Post('start')
  @UseGuards(AuthGuard)
  async startReview(@Body() body: {
    templateId: string;
    reviewTitle: string;
    reviewDescription?: string;
    excludedUserIds?: string[];
    deadline?: Date;
  }) {
    return this.leaderReviewService.startBatchLeaderReview(body);
  }

  @ApiOperation({ summary: '진행 중인 모든 평가 목록 조회', description: '현재 배포되어 진행 중이거나 완료된 전체 리더 평가 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '평가 목록 조회 성공' })
  @Get('reviews')
  @UseGuards(AuthGuard)
  async getReviews() {
    return this.leaderReviewService.getAllReviews();
  }

  @ApiOperation({ summary: '내게 할당된 리더 평가 목록', description: '로그인한 사용자 본인에게 할당된 리더 평가 작성 항목들을 조회합니다.' })
  @ApiResponse({ status: 200, description: '할당 목록 조회 성공' })
  @Get('assignments/my')
  @UseGuards(AuthGuard)
  async getMyAssignments(@Request() req: any) {
    // AuthGuard populates req.user
    const userId = req.user.sub || req.user.userId;
    return this.leaderReviewService.getMyAssignments(userId);
  }

  @ApiOperation({ summary: '할당된 리더 평가 작성 상세 조회', description: '본인에게 할당된 특정 평가 항목의 질문 및 상세 내용을 조회합니다.' })
  @ApiParam({ name: 'assignmentId', description: '조회할 할당(Assignment) ID' })
  @ApiResponse({ status: 200, description: '할당 상세 조회 성공' })
  @Get('assignments/:assignmentId')
  @UseGuards(AuthGuard)
  async getAssignment(@Param('assignmentId') id: string, @Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.leaderReviewService.getAssignmentDetail(id, userId);
  }

  @ApiOperation({ summary: '리더 평가 답변 제출', description: '할당된 평가에 대해 답변들을 작성하여 제출합니다.' })
  @ApiParam({ name: 'assignmentId', description: '제출할 할당(Assignment) ID' })
  @ApiBody({ type: SubmitAssignmentDto })
  @ApiResponse({ status: 201, description: '답변 제출 성공' })
  @Post('assignments/:assignmentId/submit')
  @UseGuards(AuthGuard)
  async submitAssignment(
    @Param('assignmentId') id: string,
    @Body() body: { answers: { questionId: string; answer: string }[] },
    @Request() req: any
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.leaderReviewService.submitAssignment(id, userId, body.answers);
  }

  // --- Result View ---

  @ApiOperation({ summary: '내가 수신한 평가 결과 목록', description: '리더 본인이 받은 평가 결과 요약(목록)을 조회합니다.' })
  @ApiResponse({ status: 200, description: '수신 평가 결과 목록 조회 성공' })
  @Get('results/my')
  @UseGuards(AuthGuard)
  async getMyResultReviews(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.leaderReviewService.getMyResultReviews(userId);
  }

  @ApiOperation({ summary: '특정 평가 결과 상세 내역 조회', description: '수신한 특정 리더 평가에 대한 상세 결과(답변 내역)를 조회합니다.' })
  @ApiParam({ name: 'reviewId', description: '조회할 평가 결과(Review) ID' })
  @ApiResponse({ status: 200, description: '평가 결과 상세 조회 성공' })
  @Get('results/:reviewId')
  @UseGuards(AuthGuard)
  async getReviewResult(@Param('reviewId') id: string, @Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.leaderReviewService.getReviewResult(id, userId);
  }
}
