import { ErrorsSpanish } from './errors-spanish';
import { ErrorsEnglish } from './errors-english';

export enum LocaleEnum {
  ES = 'es',
  EN = 'en',
}

export const getError = (errorLocale: LocaleEnum) =>
  errorLocale === LocaleEnum.EN ? ErrorsEnglish : ErrorsSpanish;
