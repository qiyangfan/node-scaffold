# node-scaffold · Node 服务脚手架

NestJS 模块化单体的**业务无关最小可运行骨架**：复制、改名、加模块即开工。
与 `longzhong/tiangong`（上游型全栈脚手架）互补——本仓只提供 API 服务起点，
不含 Web 控制台、小程序、RBAC 等平台能力；需要整套管理后台时从 tiangong 分叉。

## 技术栈

| 组件       | 版本            | 说明                                    |
| ---------- | --------------- | --------------------------------------- |
| Node.js    | 24（mise 锚定） | 当前 LTS                                |
| pnpm       | 12.18.0         | `packageManager` 单源                   |
| TypeScript | 5.9 strict      | `noUncheckedIndexedAccess` 等严格项全开 |
| NestJS     | 11              | 模块化单体                              |
| Prisma     | 6               | schema 只走迁移                         |
| PostgreSQL | 18              | 开发库走 compose（宿主 5433）           |
| pino       | 9               | JSON 日志，生产不挂 pretty              |
| zod        | 4               | 环境变量契约，启动期 fail-fast          |
| Vitest     | 4               | 单元 + HTTP 契约测试，覆盖率门禁        |

## 快速开始

```bash
mise install            # node 24 + pnpm 12
pnpm install
cp .env.example .env
pnpm db:up              # PostgreSQL 18 @ 127.0.0.1:5433
pnpm dev                # http://127.0.0.1:3000
curl -s 127.0.0.1:3000/health/live
```

加业务前先定义模型：编辑 `prisma/schema.prisma` → `pnpm prisma:migrate`。

## 门禁

```bash
make setup   # 安装依赖 + pre-commit hooks（uvx 可用时）
make gates   # lint + format + typecheck + arch + dead + dup + secrets + infra + test + build
make supply  # audit + license + SBOM（需要 registry，CI security.yml 同款）
```

CI 分三份：`ci.yml`（质量）、`security.yml`（密钥/依赖/许可证/SBOM/workflow lint）、
`codeql.yml`（SAST）。完整的门禁矩阵、触发条件与负向验收证据见
[GATES.md](GATES.md)；新增数据库/前端/契约等形态时按触发器补门禁。

## 目录

```text
src/
├── main.ts                 # 启动：helmet、日志接管、优雅停机
├── app.module.ts           # 组装：配置校验、日志、全局异常过滤器
├── config/env.ts           # 环境变量契约（新增变量必须同步 .env.example）
├── common/
│   └── all-exceptions.filter.ts  # 统一错误信封 { code, message }
├── prisma/                 # PrismaService（全局单例，OnModuleDestroy 断开）
└── health/                 # /health/live（不查依赖）、/health/ready（查 DB）
test/
└── health.e2e.test.ts      # 真实 Nest 容器 + Prisma 内存桩
```

## 约定

- **环境变量**：只从 `src/config/env.ts` 读取；非法或缺失直接拒绝启动，不打印值。
- **错误信封**：业务代码只抛 `HttpException`（或继承类），对外统一 `{ code, message }`；
  5xx 会额外写日志。
- **健康检查**：`live` 只看进程，`ready` 必须打通数据库；不要给 `live` 加依赖探测。
- **数据访问**：只经 `PrismaService`；schema 变更一律生成迁移，生产迁移由发布步骤执行
  （`pnpm prisma:deploy`），应用启动不持有 DDL 权限。
- **日志**：pino JSON；`authorization` / `cookie` 已脱敏；本地无 `pino-pretty` 时回退 JSON。
- **分层**：controller（协议）→ service（用例）→ Prisma（持久化）；业务域放
  `src/<domain>/`，不要在 common 里堆业务规则。

## 新建业务项目

```bash
cp -R ~/workspace/templates/node-scaffold ~/workspace/<新项目>
cd ~/workspace/<新项目>
rm -rf .git && git init
# 改 package.json name、deploy/compose.dev.yaml 库名、.env 的 DATABASE_URL
```

按需扩展（本种子刻意不预置）：OpenAPI 文档、Prometheus 指标、鉴权、限流、
消息队列。鉴权/RBAC 等平台能力直接参考 tiangong 的模块实现，不要在本仓重复造。
