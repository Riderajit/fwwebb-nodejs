import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AzureTokenValidationMiddleware } from './middleware/token-validation.middleware';
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import 'dotenv/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(new AzureTokenValidationMiddleware().use); // use Middleware globally 
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
