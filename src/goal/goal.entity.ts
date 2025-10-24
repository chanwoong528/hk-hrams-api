import { GoalAssessmentBy } from 'src/goal-assessment-by/goal-assessment-by.entity';
import { PerformanceAppraisal } from 'src/performance-appraisal/performance-appraisal.entity';
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

@Entity({ name: 'goals', schema: 'public', synchronize: true })
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  goalId: string;
  @Column()
  description: string;
  @CreateDateColumn()
  created: Date;
  @UpdateDateColumn()
  updated: Date;

  //GOAL ASSESSMENT BY >> CASCADE DELETE
  @OneToMany(
    () => GoalAssessmentBy,
    (goalAssessmentBy) => goalAssessmentBy.goal,
    {
      cascade: true,
    },
  )
  goalAssessmentBy: GoalAssessmentBy[];

  //PERFORMANCE APPRAISAL >> CASCADE DELETE
  @ManyToOne(() => PerformanceAppraisal, (appraisal) => appraisal.goals, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appraisalId' })
  performanceAppraisal: PerformanceAppraisal;
}
