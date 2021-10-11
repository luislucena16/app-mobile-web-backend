import {
  Module,
  ValidationPipe,
  ValidationError,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TwilioModule } from 'nestjs-twilio';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { ValidatorModule } from './utils/validator/validator.module';
import { ContactsModule } from './contacts/contacts.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ClassValidatorErrorsToValidationExceptionFactory } from './common/pipes/validation-factory.pipe';

const appPipe = (cons: (errors: ValidationError[]) => any) => ({
  provide: APP_PIPE,
  useValue: new ValidationPipe({
    whitelist: true,
    validationError: { target: false, value: false },
    exceptionFactory: cons,
  }),
});

const appInterceptor = <T>(cons: T) => ({
  provide: APP_INTERCEPTOR,
  useClass: cons,
});

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        PORT: Joi.number(),
      }),
    }),
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),
    DatabaseModule,
    ValidatorModule,
    MailModule,
    ContactsModule,
  ],
  controllers: [],
  providers: [
    appPipe(ClassValidatorErrorsToValidationExceptionFactory),
    appInterceptor(ClassSerializerInterceptor),
  ],
})
export class AppModule {}
