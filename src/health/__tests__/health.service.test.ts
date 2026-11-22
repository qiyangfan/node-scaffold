import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../prisma/prisma.service';
import { HealthService } from '../health.service';

describe('HealthService', () => {
  it('就绪探针执行数据库查询', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ ok: 1 }]);
    const service = new HealthService({ $queryRaw: queryRaw } as unknown as PrismaService);

    await expect(service.checkReady()).resolves.toEqual({ status: 'up' });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
