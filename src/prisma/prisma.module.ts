import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** 全局单例：业务模块直接注入 PrismaService，不必逐模块 import。 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
