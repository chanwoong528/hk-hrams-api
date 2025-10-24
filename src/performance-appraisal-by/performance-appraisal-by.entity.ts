import { HramsUser } from 'src/hrams-user/hrams-user.entity';
import { PerformanceAppraisal } from 'src/performance-appraisal/performance-appraisal.entity';
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

@Entity({
  name: 'performance_appraisal_by',
  schema: 'public',
  synchronize: true,
})
@Unique(['appraisalId', 'assessedById']) // ← 복합 유니크 (FK 컬럼명과 정확히 일치)
export class PerformanceAppraisalBy {
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

  //PERFORMANCE APPRAISAL >> CASCADE DELETE
  @ManyToOne(() => PerformanceAppraisal, (appraisal) => appraisal.appraisalBy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appraisalId' })
  appraisal: PerformanceAppraisal;

  //ASSESSED BY
  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'assessedById' })
  assessedBy: HramsUser;
}
