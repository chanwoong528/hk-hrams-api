import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaderReviewQuestion } from '../leader-review-question/leader-review-question.entity';
import { HramsUser } from '../hrams-user/hrams-user.entity';

@Entity('review_answers')
export class ReviewAnswer {
  @PrimaryGeneratedColumn('uuid')
  reviewAnswerId: string;

  @Column({ nullable: true, type: 'text' })
  answer: string;

  @Column()
  questionId: string;

  @ManyToOne(() => LeaderReviewQuestion, question => question.answers)
  @JoinColumn({ name: 'questionId' })
  question: LeaderReviewQuestion;

  @Column()
  createdBy: string;

  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'createdBy' })
  creator: HramsUser;

  @CreateDateColumn()
  createdAt: Date;
}
