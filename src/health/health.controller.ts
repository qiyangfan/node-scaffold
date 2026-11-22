import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** 存活探针：只要进程能响应即算存活，不查依赖。 */
  @Get('live')
  live(): { status: 'up' } {
    return { status: 'up' };
  }

  @Get('ready')
  async ready(): Promise<{ status: 'up' }> {
    return this.health.checkReady();
  }
}
