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
import { LeaderReview } from '../leader-review/leader-review.entity';
import { LeaderReviewQuestion } from '../leader-review-question/leader-review-question.entity';

@Entity('leader_review_template')
export class LeaderReviewTemplate {
  @PrimaryGeneratedColumn('uuid')
  templateId: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  leaderReviewId: string; // Nullable for Global Templates

  @ManyToOne(() => LeaderReview, review => review.templates, { nullable: true })
  @JoinColumn({ name: 'leaderReviewId' })
  leaderReview: LeaderReview;

  @OneToMany(() => LeaderReviewQuestion, question => question.template, {
    cascade: true,
  })
  questions: LeaderReviewQuestion[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
