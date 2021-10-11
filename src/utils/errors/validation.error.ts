import { ValidationError as ClassValidatorError } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidationError {
  @ApiProperty()
  message: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  validation: string;

  @ApiProperty()
  value: ClassValidatorError | string;

  constructor(args: ValidationError) {
    this.message = args.message;
    this.path = args.path;
    this.validation = args.validation;
    this.value = args.value;
  }
}
