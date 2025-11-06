import { GoalAssessmentBy } from 'src/goal-assessment-by/goal-assessment-by.entity';

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
import { AppraisalUser } from 'src/appraisal-user/appraisal-user.entity';

@Entity({ name: 'goals', schema: 'public', synchronize: true })
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  goalId: string;

  @Column()
  title: string;
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

  //APPRAISAL >> CASCADE DELETE
  @ManyToOne(() => AppraisalUser, (appraisalUser) => appraisalUser.goals, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appraisalUserId' })
  appraisalUser: AppraisalUser;
}
