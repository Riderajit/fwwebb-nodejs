//logging here 
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const start = Date.now();

    console.log(`[${new Date().toISOString()}] Incoming Request: ${request.method} ${request.url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          console.log(`[${new Date().toISOString()}] ${request.method} ${request.url} - ${response.statusCode} (${duration}ms)`);
        },
        error: error => {
          const duration = Date.now() - start;
          console.error(`[${new Date().toISOString()}] ${request.method} ${request.url} - Error: ${error.message} (${duration}ms)`);
        },
      })
    );
  }
}
