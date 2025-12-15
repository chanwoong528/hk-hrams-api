import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HramsUser } from '../hrams-user/hrams-user.entity';
import { LeaderReviewTemplate } from '../leader-review-template/leader-review-template.entity';
import { ReviewAssignment } from '../leader-review-assignment/review-assignment.entity';
import { LeaderReviewCycle } from '../leader-review-cycle/leader-review-cycle.entity';

@Entity('leader_review')
export class LeaderReview {
  @PrimaryGeneratedColumn('uuid')
  leaderReviewId: string;

  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'userId' })
  target: HramsUser;

  @Column({ nullable: true })
  cycleId: string;

  @ManyToOne(() => LeaderReviewCycle, (cycle) => cycle.reviews)
  @JoinColumn({ name: 'cycleId' })
  cycle: LeaderReviewCycle;

  @Column({ default: 'IN_PROGRESS' }) // IN_PROGRESS, COMPLETED
  status: string;

  // One Review can have ONE specific template snapshot (optional/nullable if strictly 1:1 linked by domain logic, but here we can just use 1:1 relation or 1:N but logic enforces 1)
  // Actually ERD said |o--o{ but usually one review uses one template.
  // We can put leaderReviewId on Template side as per ERD.
  
  @OneToMany(() => LeaderReviewTemplate, template => template.leaderReview)
  templates: LeaderReviewTemplate[];

  @OneToMany(() => ReviewAssignment, assignment => assignment.leaderReview)
  assignments: ReviewAssignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
