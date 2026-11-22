import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('health endpoints', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      // 内存桩替代真实数据库：健康检查只验证路由与响应契约
      .overrideProvider(PrismaService)
      .useValue({ $queryRaw: () => Promise.resolve([{ ok: 1 }]) })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health/live', async () => {
    await request(server).get('/health/live').expect(200).expect({ status: 'up' });
  });

  it('GET /health/ready', async () => {
    await request(server).get('/health/ready').expect(200).expect({ status: 'up' });
  });

  it('未知路由返回统一错误信封', async () => {
    const res = await request(server).get('/missing').expect(404);
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' });
  });
});
