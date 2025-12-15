import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaderReview } from '../leader-review/leader-review.entity';
import { HramsUser } from '../hrams-user/hrams-user.entity';

@Entity('review_assignment')
export class ReviewAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignmentId: string;

  @Column()
  leaderReviewId: string;

  @ManyToOne(() => LeaderReview, review => review.assignments)
  @JoinColumn({ name: 'leaderReviewId' })
  leaderReview: LeaderReview;

  @Column()
  reviewerId: string;

  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: HramsUser;

  @Column({ default: 'NOT_STARTED' }) // NOT_STARTED, IN_PROGRESS, SUBMITTED
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
