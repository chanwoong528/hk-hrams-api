import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'hrams_user', schema: 'public', synchronize: true })
export class HramsUser {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  created: Date;

  @Column()
  updated: Date;
}
