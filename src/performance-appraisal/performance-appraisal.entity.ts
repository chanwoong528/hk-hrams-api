import { Goal } from 'src/goal/goal.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PerformanceAppraisalBy } from 'src/performance-appraisal-by/performance-appraisal-by.entity';
import { HramsUser } from 'src/hrams-user/hrams-user.entity';

@Entity({ name: 'performance_appraisal', schema: 'public', synchronize: true })
@Unique(['assessTarget', 'appraisalType'])
export class PerformanceAppraisal {
  @PrimaryGeneratedColumn('uuid')
  appraisalId: string;

  @Column()
  appraisalType: string; // "2025-q1" | "2025-q2" | "2025-q3" | "2025-q4" or "2025-mid" | "2025-final" or "yearly ex) 2025"
  // incase appraisal should be done more than once, it will be unique

  @Column()
  title: string; // probably most the time it will be yearly appraisal

  @Column({ nullable: true })
  description: string;

  @Column()
  endDate: Date;

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
  //where user type is reviewee or both, if reviewer
}
