import { ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class ErrorHandler implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let message = exception.message || 'Internal server error';
    let errors = null;

    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse() as any;
      if (exceptionResponse && typeof exceptionResponse === 'object') {
        errors = this.processBadRequestException(exceptionResponse);
        if (errors) {
          message = 'Validation failed';
        } else {
          message = typeof exceptionResponse.message === 'string' ? exceptionResponse.message : message;
        }
      }
    }

    this.sendErrorResponse(response, status, message, errors);
  }

  private processBadRequestException(exceptionResponse: any): any {
    if (Array.isArray(exceptionResponse.message)) {
      return exceptionResponse.message.map(error => this.formatError(error));
    } else if (typeof exceptionResponse.message === 'object') {
      return Object.entries(exceptionResponse.message).map(([key, value]) => ({
        field: key,
        message: Array.isArray(value) ? value.join(', ') : String(value),
      }));
    }
    return null;
  }

  private formatError(error: any): { field: string; message: string } {
    return {
      field: error.property,
      message: error.constraints ? Object.values(error.constraints).join(', ') : 'Invalid value',
    };
  }

  private sendErrorResponse(response: Response, status: number, message: string, errors: any): void {
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors: errors || undefined,
    });
  }
}
