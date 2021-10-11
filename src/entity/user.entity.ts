import { Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContactApp } from './contactsApp.entity';
import { Invitation } from './invitation.entity';

export enum UserStatus {
  pending = 'pending',
  active = 'active',
  checking = 'checking',
  rejected = 'rejected',
}

export enum ExtraSecurityType {
  disabled = 'disabled',
  faceId = 'faceId',
  touchId = 'touchId',
  pin = 'pin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  avatarUri?: string;

  @Column({ default: false })
  emailVerify: boolean;

  @Exclude()
  @Column({ nullable: true })
  facebookId: string;

  @Column({ nullable: true, unique: true })
  phoneNumber: string;

  @Column({ default: false })
  phoneNumberVerify: boolean;

  @Index()
  @Column({ unique: true })
  username: string;

  @Column()
  fullname: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    default: ExtraSecurityType.disabled,
    enum: ExtraSecurityType,
  })
  extraSecurity: ExtraSecurityType;

  @Exclude()
  @Column({ nullable: true })
  extraSecurityPin: string;

  @Column({ nullable: true })
  firebaseToken: string;

  @Column({ nullable: true })
  birthday: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.pending })
  status: UserStatus;

  @OneToMany(() => ContactApp, (contactApp) => contactApp.user)
  contactApps: ContactApp[];

  @OneToMany(() => Invitation, (invitation) => invitation.user)
  invitations: Invitation[];

  @Column({ nullable: true })
  referralLink: string;

  @OneToMany(() => Invitation, (invitation) => invitation.userGuest)
  invitationsGuest?: Invitation[];

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
