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
import { HramsUser } from 'src/hrams-user/hrams-user.entity';
import { Department } from 'src/department/department.entity';

@Entity({ name: 'hrams_user_department', schema: 'public', synchronize: true })
@Unique(['userId', 'departmentId'])
export class HramsUserDepartment {
  @PrimaryGeneratedColumn('uuid')
  hramsUserDepartmentId: string;

  @Column()
  userId: string;

  @Column()
  departmentId: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @ManyToOne(() => HramsUser)
  @JoinColumn({ name: 'userId' })
  user: HramsUser;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;
}
