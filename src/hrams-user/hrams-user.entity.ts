import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { HramsUserDepartment } from 'src/hrams-user-department/hrams-user-department.entity';

@Entity({ name: 'hrams_user', schema: 'public', synchronize: true })
export class HramsUser {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  koreanName: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @OneToMany(() => HramsUserDepartment, (hud) => hud.user, {
    cascade: false,
    eager: false,
  })
  hramsUserDepartments: HramsUserDepartment[];
}
