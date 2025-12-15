import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaderReview } from '../leader-review/leader-review.entity';

@Entity('leader_review_cycle')
export class LeaderReviewCycle {
  @PrimaryGeneratedColumn('uuid')
  reviewCycleId: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => LeaderReview, (review) => review.cycle)
  reviews: LeaderReview[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
