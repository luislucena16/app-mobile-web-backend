import { ApiProperty } from '@nestjs/swagger';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from '../../utils/errors/validation.error';

export class ValidationException extends HttpException {
  static readonly code = 'VALIDATION_ERROR';
  static readonly message = 'A logic validation has not been fullfilled';
  static readonly statusCode = HttpStatus.UNPROCESSABLE_ENTITY;

  @ApiProperty()
  readonly code: string = ValidationException.code;

  @ApiProperty()
  readonly message: string = ValidationException.message;

  @ApiProperty({ type: ValidationError, isArray: true })
  readonly reasons: ValidationError[];

  @ApiProperty()
  readonly statusCode: number = ValidationException.statusCode;

  constructor(reasons: ValidationError[]) {
    super(
      {
        statusCode: ValidationException.statusCode,
        message: ValidationException.message,
        reasons,
        code: ValidationException.code,
      },
      ValidationException.statusCode,
    );
    this.reasons = reasons;
  }
}
