import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AzureTokenValidationMiddleware } from 'src/middleware/token-validation.middleware';
@Module({
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AzureTokenValidationMiddleware)
      .forRoutes('/users/profile');
  }
}
