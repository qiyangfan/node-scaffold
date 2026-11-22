import {
  BadRequestException,
  type ArgumentsHost,
  HttpException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AllExceptionsFilter } from '../all-exceptions.filter';

interface RecordedResponse {
  statusCode?: number;
  body?: unknown;
}

function createHost(recorded: RecordedResponse): ArgumentsHost {
  const response = {
    status: (code: number) => {
      recorded.statusCode = code;
      return { json: (body: unknown) => (recorded.body = body) };
    },
  } as unknown as Response;
  return { switchToHttp: () => ({ getResponse: () => response }) } as unknown as ArgumentsHost;
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('HttpException 映射为契约错误码', () => {
    const recorded: RecordedResponse = {};
    filter.catch(new BadRequestException('bad input'), createHost(recorded));

    expect(recorded.statusCode).toBe(400);
    expect(recorded.body).toEqual({ code: 'VALIDATION_ERROR', message: 'bad input' });
  });

  it('数组消息合并为单条文本', () => {
    const recorded: RecordedResponse = {};
    filter.catch(new HttpException({ message: ['a', 'b'] }, 400), createHost(recorded));

    expect(recorded.body).toMatchObject({ message: 'a; b' });
  });

  it('未知状态码回落 INTERNAL_ERROR', () => {
    const recorded: RecordedResponse = {};
    filter.catch(new NotFoundException(), createHost(recorded));

    expect(recorded.body).toMatchObject({ code: 'NOT_FOUND' });

    const teapot: RecordedResponse = {};
    filter.catch(new HttpException('teapot', 418), createHost(teapot));
    expect(teapot.body).toMatchObject({ code: 'INTERNAL_ERROR', message: 'teapot' });
  });

  it('非 HttpException 统一 500 且写错误日志', () => {
    const errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const recorded: RecordedResponse = {};
    filter.catch(new Error('boom'), createHost(recorded));

    expect(recorded.statusCode).toBe(500);
    expect(recorded.body).toEqual({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
