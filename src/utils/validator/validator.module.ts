import { Module } from '@nestjs/common';
import { Unique } from './unique';

@Module({
  providers: [Unique],
})
export class ValidatorModule {}
