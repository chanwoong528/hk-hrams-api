import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Goal } from 'src/goal/goal.entity';

@Entity({ name: 'goal_assessment_by', schema: 'public', synchronize: true })
export class GoalAssessmentBy {
  @PrimaryGeneratedColumn('uuid')
  goalAssessId: string;

  @Column()
  grade: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column()
  goalId: string;

  @ManyToOne(() => Goal)
  @JoinColumn({ name: 'goalId' })
  goal: Goal;
}
