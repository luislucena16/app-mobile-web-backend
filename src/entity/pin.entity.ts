import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CodeVerificationType {
  forgotPassword = 'forgot-password',
  verifyMail = 'verify-mail',
  verifyPhone = 'verify-phone',
  changeEmail = 'change-email',
}

@Entity()
export class Pin {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    default: () => 'cast (floor( 100000 + random() * 899998) as text)',
  })
  pin: string;

  @Column()
  ref: string;

  @Column({ default: true })
  valid: boolean;

  @Column({ type: 'enum', enum: CodeVerificationType })
  typePin: CodeVerificationType;

  @Column({ type: 'timestamptz', default: new Date() })
  createAt?: Date;

  constructor(partial: Partial<Pin>) {
    Object.assign(this, partial);
  }
}
