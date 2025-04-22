import { forwardRef, Module } from '@nestjs/common';
import { ConstantModule } from '../../constant/constant.module';
@Module({
  imports: [ ConstantModule ],
  providers: [],
  exports: [],
})
export class LibModule {}
