# AGENTS.md — node-scaffold 执行者工作契约

本仓是**业务无关的 Node 服务种子**，不是某个产品。任何改动都必须保持
「复制即用」：克隆或复制后只改标识与连接串就能开工。

## 定位

- 提供：NestJS 模块化单体骨架、环境变量 fail-fast、统一错误信封、健康检查、
  JSON 日志、Prisma 数据访问、门禁与 CI。
- 不提供：Web 控制台、小程序、RBAC、业务实体、消息队列、微服务拆分。
  这些属于业务项目或 tiangong（上游型全栈脚手架），不要塞进本仓。

## 硬性纪律

1. **业务无关**：禁止出现订单、课程、商家、用户档案等业务实体；示例代码只能
   是基建（health）与协议（错误信封）。
2. **配置单源**：环境变量只经 `src/config/env.ts`（zod）进入应用；新增变量必须
   同步 `.env.example`，缺失/非法即拒绝启动。
3. **错误契约**：对外错误一律 `{ code, message }`；业务抛 `HttpException`，
   禁止在 controller 里手写错误响应体。
4. **数据访问**：只经全局 `PrismaService`；禁止在模块内自建 PrismaClient。
   schema 变更必须生成迁移，生产迁移由发布步骤执行。
5. **探针纪律**：`/health/live` 不查依赖，`/health/ready` 必须探测数据库。
6. **门禁不可绕过**：`make gates`（lint / format:check / typecheck /
   test:coverage / build）与 CI 同款；不允许提交时跳过一个红门禁。

## 分层

```text
controller ──> service ──> PrismaService ──> PostgreSQL
```

- controller：参数解析、状态码、调用 service，不写业务规则。
- service：用例编排、事务边界。
- 实体映射与查询：只放 service 或独立 repository，不穿透到 controller。

## 测试

- 单元测试放 `src/**/__tests__/`；HTTP 契约测试放 `test/`。
- 测试不得依赖本机数据库；需要 DB 语义时用 Prisma 桩。
- 新增对外路由必须补一条契约测试（状态码 + 响应形状）。
