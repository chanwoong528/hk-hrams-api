import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { LeaderReviewTemplate } from '../leader-review-template/leader-review-template.entity';
import { ReviewAnswer } from '../leader-review-answer/review-answer.entity';

@Entity('template_question')
export class LeaderReviewQuestion {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  questionId: string;

  @Column()
  questionText: string;

  @Column({ default: 'LIKERT_5' })
  questionType: string;

  @Column({ default: 0 })
  order: number;

  @Column()
  templateId: string;

  @ManyToOne(() => LeaderReviewTemplate, template => template.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'templateId' })
  template: LeaderReviewTemplate;

  @OneToMany(() => ReviewAnswer, answer => answer.question)
  answers: ReviewAnswer[];
}
