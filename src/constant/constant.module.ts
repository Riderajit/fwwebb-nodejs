import { Module } from '@nestjs/common';
import { ConstantConfig } from './constant.config';

@Module({
  providers: [ConstantConfig],
  exports: [ConstantConfig],
})
export class ConstantModule {}
