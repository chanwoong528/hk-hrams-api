import { Body, Controller, Get, Param, Post, Put, UseGuards, Request } from '@nestjs/common';
import { LeaderReviewService } from './leader-review.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('leader-review')
export class LeaderReviewController {
  constructor(private readonly leaderReviewService: LeaderReviewService) { }

  @Post('templates')
  @UseGuards(AuthGuard)
  async createTemplate(@Body() body: any) {
    return this.leaderReviewService.createGlobalTemplate(body);
  }

  @Get('templates')
  @UseGuards(AuthGuard)
  async getTemplates() {
    return this.leaderReviewService.getAllGlobalTemplates();
  }

  @Get('templates/:templateId')
  @UseGuards(AuthGuard)
  async getTemplate(@Param('templateId') templateId: string) {
    return this.leaderReviewService.getTemplate(templateId);
  }

  @Put('templates/:templateId')
  @UseGuards(AuthGuard)
  async updateTemplate(@Param('templateId') templateId: string, @Body() body: any) {
    return this.leaderReviewService.updateTemplate(templateId, body);
  }
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

  @Get('reviews')
  @UseGuards(AuthGuard)
  async getReviews() {
    return this.leaderReviewService.getAllReviews();
  }

  @Get('assignments/my')
  @UseGuards(AuthGuard)
  async getMyAssignments(@Request() req: any) {
    // AuthGuard populates req.user
    const userId = req.user.sub || req.user.userId;
    return this.leaderReviewService.getMyAssignments(userId);
  }

  @Get('assignments/:assignmentId')
  @UseGuards(AuthGuard)
  async getAssignment(@Param('assignmentId') id: string, @Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.leaderReviewService.getAssignmentDetail(id, userId);
  }

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

  @Get('results/my')
  @UseGuards(AuthGuard)
  async getMyResultReviews(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.leaderReviewService.getMyResultReviews(userId);
  }

  @Get('results/:reviewId')
  @UseGuards(AuthGuard)
  async getReviewResult(@Param('reviewId') id: string, @Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.leaderReviewService.getReviewResult(id, userId);
  }
}
