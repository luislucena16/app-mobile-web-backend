import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { IsForbiddenWord } from '../../utils/validator/is-forbidden-word';
import { Unique } from '../../utils/validator/unique';
import { User, UserStatus } from './../../entity/user.entity';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail(
    {},
    { message: 'El email que introdujo no tiene un formato correcto' },
  )
  email: string;

  @IsOptional()
  @ApiProperty()
  phoneNumber: string;

  @IsOptional()
  @ApiProperty()
  codeVerification: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Validate(Unique, [User])
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsForbiddenWord({ message: 'Introdujo una palabra no permitida' })
  password: string;

  @IsOptional()
  @ApiProperty()
  extraSecurityPin: string;

  @IsOptional()
  @ApiProperty()
  facebookId: string;
}

export default RegisterDto;

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsForbiddenWord({ message: 'Introdujo una palabra no permitida' })
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsForbiddenWord({ message: 'Introdujo una palabra no permitida' })
  confirmPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsForbiddenWord({ message: 'Introdujo una palabra no permitida' })
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ref: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pin: string;
}

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  fullname?: string;

  /*@ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;*/

  @ApiProperty()
  @IsOptional()
  @IsString()
  firebaseToken?: string;
}

export class ValidatePinDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({ description: 'Phone number' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'Email' })
  @IsOptional()
  email?: string;
}

export class ValidatePinNewEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({ description: 'Email' })
  @IsString()
  @IsEmail(
    {},
    { message: 'El email que introdujo no tiene un formato correcto' },
  )
  @IsNotEmpty()
  email: string;
}

export class NewEmailDto {
  @ApiProperty({ description: 'Email' })
  @IsNotEmpty()
  @IsEmail(
    {},
    { message: 'El email que introdujo no tiene un formato correcto' },
  )
  email: string;
}

export class KycDto {
  @ApiProperty({ example: 'dd/mm/yyyy' })
  @IsString()
  @IsNotEmpty()
  birthday: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  status?: UserStatus;

  id?: number;
}

export class ChangeUserStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  //@IsString()
  @IsEnum(UserStatus)
  status: UserStatus;
}
