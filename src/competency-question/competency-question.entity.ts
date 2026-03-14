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
import { Appraisal } from '../appraisal/appraisal.entity';
import { Department } from '../department/department.entity';
import { HramsUser } from '../hrams-user/hrams-user.entity';
import { CompetencyAssessment } from '../competency-assessment/competency-assessment.entity';

@Entity({ name: 'competency_question', schema: 'public', synchronize: true })
export class CompetencyQuestion {
  @PrimaryGeneratedColumn('uuid')
  competencyId: string;

  @Column({ type: 'text' })
  question: string;

  @Column()
  appraisalId: string;

  @ManyToOne(() => Appraisal, (appraisal) => appraisal.competencyQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appraisalId' })
  appraisal: Appraisal;

  @Column()
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  jobGroup: string;

  @Column()
  createdBy: string;

  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'createdBy' })
  creator: HramsUser;

  @Column({ nullable: true })
  lastModifiedBy: string;

  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'lastModifiedBy' })
  lastModifier: HramsUser;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @OneToMany(
    () => CompetencyAssessment,
    (assessment: CompetencyAssessment) => assessment.competencyQuestion,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  competencyAssessments: CompetencyAssessment[];
}
