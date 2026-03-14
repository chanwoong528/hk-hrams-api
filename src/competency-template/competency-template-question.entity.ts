import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompetencyTemplate } from './competency-template.entity';

@Entity({ name: 'competency_template_question', schema: 'public', synchronize: true })
export class CompetencyTemplateQuestion {
  @PrimaryGeneratedColumn('uuid')
  questionId: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ default: 0 })
  order: number;

  @Column()
  templateId: string;

  @ManyToOne(() => CompetencyTemplate, (template) => template.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'templateId' })
  template: CompetencyTemplate;
}
