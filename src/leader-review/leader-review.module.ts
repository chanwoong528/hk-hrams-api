import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderReviewController } from './leader-review.controller';
import { LeaderReviewService } from './leader-review.service';
import { LeaderReview } from './leader-review.entity';
import { LeaderReviewTemplate } from '../leader-review-template/leader-review-template.entity';
import { LeaderReviewQuestion } from '../leader-review-question/leader-review-question.entity';
import { ReviewAssignment } from '../leader-review-assignment/review-assignment.entity';
import { ReviewAnswer } from '../leader-review-answer/review-answer.entity';
import { HramsUser } from '../hrams-user/hrams-user.entity';
import { LeaderReviewCycle } from '../leader-review-cycle/leader-review-cycle.entity';
import { AuthModule } from '../auth/auth.module';
import { HramsUserModule } from '../hrams-user/hrams-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaderReview,
      LeaderReviewTemplate,
      LeaderReviewQuestion,
      ReviewAssignment,
      ReviewAnswer,
      HramsUser, // Add User entity
      LeaderReviewCycle,
    ]),
    AuthModule,
    HramsUserModule,
  ],
  controllers: [LeaderReviewController],
  providers: [LeaderReviewService],
})
export class LeaderReviewModule {}
