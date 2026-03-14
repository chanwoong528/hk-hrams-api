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
import { CompetencyTemplateQuestion } from './competency-template-question.entity';

@Entity({ name: 'competency_template', schema: 'public', synchronize: true })
export class CompetencyTemplate {
  @PrimaryGeneratedColumn('uuid')
  templateId: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  jobGroup: string;

  @Column()
  createdBy: string;

  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'createdBy' })
  creator: HramsUser;

  @OneToMany(
    () => CompetencyTemplateQuestion,
    (question) => question.template,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  questions: CompetencyTemplateQuestion[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
