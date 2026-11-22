import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

const STATUS_CODE_MAP: ReadonlyMap<number, string> = new Map([
  [HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR'],
  [HttpStatus.UNAUTHORIZED, 'UNAUTHENTICATED'],
  [HttpStatus.FORBIDDEN, 'FORBIDDEN'],
  [HttpStatus.NOT_FOUND, 'NOT_FOUND'],
  [HttpStatus.CONFLICT, 'CONFLICT'],
]);

function messageOf(body: unknown, fallback: string): string {
  const message =
    typeof body === 'string' ? body : (body as { message?: string | string[] } | null)?.message;
  if (Array.isArray(message)) {
    return message.join('; ');
  }
  return message ?? fallback;
}

/** 全链路兜底：业务代码只管抛 HttpException，对外统一错误信封。 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttp
      ? messageOf(exception.getResponse(), exception.message)
      : 'Internal server error';

    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({
      code: STATUS_CODE_MAP.get(status) ?? 'INTERNAL_ERROR',
      message,
    });
  }
}
