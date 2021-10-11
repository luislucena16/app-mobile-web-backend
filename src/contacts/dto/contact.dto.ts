import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class NewContactDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  fullname?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class AddUserContactDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  alias?: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  favorite?: boolean;
}

export class UpdateContactDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contactId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  alias?: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  favorite: boolean;
}
