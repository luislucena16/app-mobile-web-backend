import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'aws-sdk';
import { useContainer } from 'class-validator';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new TransformInterceptor());
  const options = new DocumentBuilder()
    .setTitle('App Project')
    .setDescription('App')
    .setVersion('1.0')
    .setContact('Luis Lucena.', '', 'lucenaluis137@gmail.com')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  app.use('/photos', express.static(join(__dirname, '..', 'photos')));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      skipMissingProperties: true,
    }),
  );
  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('BUCKETACCESSKEYID'),
    secretAccessKey: configService.get('BUCKETSECRETACCESSKEY'),
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
