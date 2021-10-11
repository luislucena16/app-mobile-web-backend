import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ContactApp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, default: null })
  phoneNumber?: string;

  @Column({ nullable: true, default: null })
  fullname?: string;

  @Column({ nullable: true, default: null })
  username?: string;

  @Column({ nullable: true, default: null })
  alias?: string;

  @Column({ nullable: true, default: false })
  favorite?: boolean;

  @ManyToOne(() => User, (user) => user.contactApps)
  user: User;
}
