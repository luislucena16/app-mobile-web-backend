import { ValidationError as ClassValidatorError } from 'class-validator';
import { ValidationError } from '../../utils/errors/validation.error';
import { ValidationException } from '../exceptions/validation.exception';


export const ClassValidatorErrorsToValidationErrorFactory = (
  originalError: ClassValidatorError,
  currentErrors: ValidationError[] = [],
  currentKey = '',
) => {
  const fieldPath = currentKey
    ? `${currentKey}.${originalError.property}`
    : originalError.property;
  if (originalError.constraints) {
    for (const validation in originalError.constraints) {
      if (originalError.constraints.hasOwnProperty(validation)) {
        const message = originalError.constraints[validation];
        currentErrors.push(
          new ValidationError({
            message,
            path: fieldPath,
            validation,
            value: originalError.value as ClassValidatorError,
          }),
        );
      }
    }
  }
  if (originalError.children) {
    for (const child of originalError.children) {
      ClassValidatorErrorsToValidationErrorFactory(
        child,
        currentErrors,
        fieldPath,
      );
    }
  }
  return currentErrors;
};

export const ClassValidatorErrorsToValidationExceptionFactory = (
  errors: ClassValidatorError[],
) => {
  const formattedErrors: ValidationError[] = errors
    .map((error: ClassValidatorError) =>
      ClassValidatorErrorsToValidationErrorFactory(error),
    )
    .reduce(
      (acum: ValidationError[], cur: ValidationError[]) => acum.concat(cur),
      [],
    );
  return new ValidationException(formattedErrors);
};
