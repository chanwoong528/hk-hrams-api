import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
}
