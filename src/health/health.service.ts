import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  /** 就绪探针必须依赖真实数据库：探活成功才算可接流量。 */
  async checkReady(): Promise<{ status: 'up' }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'up' };
  }
}
