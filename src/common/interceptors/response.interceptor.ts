// src/common/interceptors/response.interceptor.ts

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        /**
         * ✅ IMPORTANT:
         * If response is already handled (files, PDFs, streams),
         * do NOT wrap it.
         */
        if (
          Buffer.isBuffer(data) ||
          response.headersSent ||
          response.getHeader('Content-Type') ===
            'application/pdf'
        ) {
          return data;
        }

        return {
          success: true,
          timestamp: new Date().toISOString(),
          data,
        };
      }),
    );
  }
}
