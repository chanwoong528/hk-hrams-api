import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CompetencyQuestion } from '../competency-question/competency-question.entity';
import { AppraisalUser } from '../appraisal-user/appraisal-user.entity';
import { HramsUser } from '../hrams-user/hrams-user.entity';

@Entity({ name: 'competency_assessment', schema: 'public', synchronize: true })
@Unique(['competencyId', 'appraisalUserId', 'evaluatorId']) // Changed from evaluatorType to evaluatorId
export class CompetencyAssessment {
  @PrimaryGeneratedColumn('uuid')
  assessmentId: string;

  @Column()
  competencyId: string;

  @ManyToOne(
    () => CompetencyQuestion,
    (question) => question.competencyAssessments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'competencyId' })
  competencyQuestion: CompetencyQuestion;

  @Column()
  appraisalUserId: string;

  @ManyToOne(
    () => AppraisalUser,
    (appraisalUser) => appraisalUser.competencyAssessments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'appraisalUserId' })
  appraisalUser: AppraisalUser;

  @Column()
  evaluatorId: string;

  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'evaluatorId' })
  evaluator: HramsUser;

  @Column({ nullable: true })
  grade: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
