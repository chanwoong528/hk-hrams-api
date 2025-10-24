import { Goal } from 'src/goal/goal.entity';
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
import { PerformanceAppraisalBy } from 'src/performance-appraisal-by/performance-appraisal-by.entity';
import { HramsUser } from 'src/hrams-user/hrams-user.entity';

@Entity({ name: 'performance_appraisal', schema: 'public', synchronize: true })
export class PerformanceAppraisal {
  @PrimaryGeneratedColumn('uuid')
  appraisalId: string;

  @Column()
  title: string; // probably most the time it will be yearly appraisal

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  //GOAL >> CASCADE DELETE
  @OneToMany(() => Goal, (goal) => goal.performanceAppraisal, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  goals: Goal[];

  //PERFORMANCE APPRAISAL BY >> CASCADE DELETE
  @OneToMany(
    () => PerformanceAppraisalBy,
    (appraisalBy) => appraisalBy.appraisal,
    { cascade: true, onDelete: 'CASCADE' },
  )
  appraisalBy: PerformanceAppraisalBy[];

  @ManyToOne(() => HramsUser, { nullable: false })
  @JoinColumn({ name: 'assessTargetId' })
  assessTarget: HramsUser;
}
