import { AppraisalUser } from 'src/appraisal-user/appraisal-user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  // JoinColumn,
  // ManyToOne,
  // OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
// import { AppraisalBy } from 'src/appraisal-by/appraisal-by.entity';
// import { HramsUser } from 'src/hrams-user/hrams-user.entity';
// import { Goal } from 'src/goal/goal.entity';
@Entity({ name: 'appraisal', schema: 'public', synchronize: true })
@Unique(['appraisalType'])
export class Appraisal {
  @PrimaryGeneratedColumn('uuid')
  appraisalId: string;

  @Column()
  appraisalType: string; // "2025-q1" | "2025-q2" | "2025-q3" | "2025-q4" or "2025-mid" | "2025-final" or "yearly ex) 2025"
  // incase appraisal should be done more than once, it will be unique

  @Column()
  title: string; // probably most the time it will be yearly appraisal

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: 'draft' })
  status: string; // "ongoing" | "draft" | "finished"

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @OneToMany(() => AppraisalUser, (appraisalUser) => appraisalUser.appraisal, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  appraisalUsers: AppraisalUser[];

  // //GOAL >> CASCADE DELETE
  // @OneToMany(() => Goal, (goal) => goal.appraisal, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // goals: Goal[];

  // //APPRAISAL BY >> CASCADE DELETE
  // @OneToMany(() => AppraisalBy, (appraisalBy) => appraisalBy.appraisal, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // appraisalBy: AppraisalBy[];

  // @ManyToOne(() => HramsUser, { nullable: false })
  // @JoinColumn({ name: 'assessTargetId' })
  // assessTarget: HramsUser;
  // //where user type is reviewee or both, if reviewer
}
