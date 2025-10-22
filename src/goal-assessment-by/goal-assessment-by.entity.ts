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
import { Goal } from 'src/goal/goal.entity';
import { HramsUser } from 'src/hrams-user/hrams-user.entity';

@Entity({ name: 'goal_assessment_by', schema: 'public', synchronize: true })
@Unique(['goalId', 'gradedBy'])
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

  @Column()
  gradedBy: string;

  @ManyToOne(() => HramsUser, { cascade: false })
  @JoinColumn({ name: 'gradedBy' })
  gradedByUser: HramsUser;
}
