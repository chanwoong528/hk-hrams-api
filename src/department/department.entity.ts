import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { HramsUser } from 'src/hrams-user/hrams-user.entity';
import { HramsUserDepartment } from 'src/hrams-user-department/hrams-user-department.entity';

@Tree('closure-table')
@Entity({ name: 'department', schema: 'public', synchronize: true })
export class Department {
  @PrimaryGeneratedColumn('uuid')
  departmentId: string;

  @Column({ unique: true })
  departmentName: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @TreeParent()
  @JoinColumn()
  parent?: Department | null;

  @TreeChildren()
  children: Department[];

  // Department must have one leader
  @Column({ nullable: true })
  leaderId: string;

  @ManyToOne(() => HramsUser, { nullable: true })
  @JoinColumn({ name: 'leaderId' })
  leader: HramsUser;

  @OneToMany(
    () => HramsUserDepartment,
    (hud) => hud.department,
    { cascade: false, eager: false }, // 필요에 맞게
  )
  hramsUserDepartments: HramsUserDepartment[];
}
