import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { LeaderReviewService } from './leader-review.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('leader-review')
export class LeaderReviewController {
  constructor(private readonly leaderReviewService: LeaderReviewService) {}

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
}
