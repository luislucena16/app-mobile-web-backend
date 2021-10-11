import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum StatusInvitation {
  pending = 'pending',
  complete = 'complete',
  noTransactions = 'no-transactions',
}

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'enum',
    enum: StatusInvitation,
    default: StatusInvitation.pending,
  })
  statusInvitation: StatusInvitation;

  //usuario que invita
  @ManyToOne(() => User, (user) => user.invitations)
  user: User;

  //usuario que invita
  @ManyToOne(() => User, (user) => user.invitationsGuest)
  userGuest?: User;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;
}
