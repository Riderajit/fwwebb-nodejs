import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map(data => {
        const response: any = {
          success: true,
          message: data.message || 'Successful',
        };

        const { ...otherData } = data;
        if (Object.keys(otherData).length > 0) {
          Object.assign(response, otherData);
        } else {
          response.data = data;
        }
        return response;
      })
    );
  }
}
