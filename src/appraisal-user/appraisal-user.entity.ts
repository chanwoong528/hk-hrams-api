import { HramsUser } from 'src/hrams-user/hrams-user.entity';
import { Appraisal } from 'src/appraisal/appraisal.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'appraisal_user',
  schema: 'public',
  synchronize: true,
})
export class AppraisalUser {
  @PrimaryGeneratedColumn('uuid')
  appraisalUserId: string;

  @Column({ default: null, nullable: true })
  status: string; // "submitted" | null

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  //APPRAISAL >> CASCADE DELETE
  @ManyToOne(() => Appraisal, (appraisal) => appraisal.appraisalId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appraisalId' })
  appraisal: Appraisal;

  //Owner of the appraisal
  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'userId' })
  owner: HramsUser;

  //Assessed by the user
  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'assessedById' })
  assessedBy: HramsUser;
}
