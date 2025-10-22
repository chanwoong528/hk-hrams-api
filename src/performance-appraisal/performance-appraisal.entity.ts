import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'performance_appraisal', schema: 'public', synchronize: true })
export class PerformanceAppraisal {
  @PrimaryGeneratedColumn('uuid')
  appraisalId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  created: Date;

  @Column()
  updated: Date;
}
