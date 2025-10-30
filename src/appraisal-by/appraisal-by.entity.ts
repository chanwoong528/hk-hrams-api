import { HramsUser } from 'src/hrams-user/hrams-user.entity';

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
import { AppraisalUser } from 'src/appraisal-user/appraisal-user.entity';

@Entity({
  name: 'appraisal_by',
  schema: 'public',
  synchronize: true,
})
@Unique(['appraisalId', 'assessedById']) // ← 복합 유니크 (FK 컬럼명과 정확히 일치)
export class AppraisalBy {
  @PrimaryGeneratedColumn('uuid')
  appraisalById: string;

  @Column()
  assessType: string; // "performance" | "competency"

  @Column()
  assessTerm: string; // "mid" | "final"

  @Column()
  grade: string; // "A" | "B" | "C" (performance)  OR  "O" | "E" | "M" | "P" | "N" (competency)

  @Column()
  comment: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column()
  appraisalId: string;

  @Column()
  assessedById: string;

  //APPRAISAL >> CASCADE DELETE
  @ManyToOne(
    () => AppraisalUser,
    (appraisalUser) => appraisalUser.appraisalUserId,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'appraisalId' })
  appraisalUser: AppraisalUser;

  //ASSESSED BY
  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'assessedById' })
  assessedBy: HramsUser;
}
