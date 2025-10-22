import { GoalAssessmentBy } from 'src/goal-assessment-by/goal-assessment-by.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @OneToMany(
    () => GoalAssessmentBy,
    (goalAssessmentBy) => goalAssessmentBy.goal,
    {
      cascade: true,
    },
  )
  goalAssessmentBy: GoalAssessmentBy[];
}
