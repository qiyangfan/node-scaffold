# GATES — 门禁矩阵、触发条件与负向验收

本仓是复制型种子：门禁按"实际具备的形态面"配置。新增形态时按下表触发器补门禁，
不要预装无法真跑的检查（纸面门禁）。

## 本地 / CI 对应

```bash
make gates    # lint + format + typecheck + arch + dead + dup + secrets + infra + test + build
make supply   # audit + license + SBOM（需要 registry，CI security.yml 同款）
```

| 门禁                                      | 命令                               | 本地          | CI                       | 负向验收（2026-11-21）                      |
| ----------------------------------------- | ---------------------------------- | ------------- | ------------------------ | ------------------------------------------- |
| ESLint（type-aware + sonarjs + 结构规则） | `pnpm lint`                        | ✅            | ci.yml                   | ✅ 植入未用变量 → 红                        |
| Prettier                                  | `pnpm format:check`                | ✅            | ci.yml                   | ✅ 植入未格式化 JSON → 红                   |
| 类型                                      | `pnpm typecheck`                   | ✅            | ci.yml                   | ✅ 植入类型错误 → 红                        |
| 架构/循环（dependency-cruiser）           | `pnpm lint:arch`                   | ✅            | ci.yml                   | ✅ 植入 prisma→health 反向依赖 → 红         |
| 死代码（knip）                            | `pnpm lint:dead`                   | ✅            | ci.yml                   | ✅ 植入未引用文件 → 红                      |
| 重复（jscpd 5%）                          | `pnpm dup:check`                   | ✅            | ci.yml                   | ✅ 植入 40 行重复（10.4%）→ 红              |
| 覆盖率阈值                                | `pnpm test:coverage`               | ✅            | ci.yml                   | ✅ 强制 statements=100 → 红                 |
| 密钥（gitleaks）                          | `gitleaks dir .` / `detect` 全历史 | ✅            | security.yml             | ✅ 植入假 AKIA 凭据 → 红                    |
| 提交信息                                  | `scripts/commitcheck.sh --file`    | ✅ pre-commit | -                        | ✅ 非法标题 → 红                            |
| Workflow lint                             | `actionlint`                       | ✅            | security.yml             | ✅ 非法 YAML → 红                           |
| Dockerfile lint                           | `hadolint Dockerfile`              | ✅            | -（镜像构建时）          | ✅ 未固定 apt 版本 → 红                     |
| Markdown lint                             | `markdownlint-cli2`                | ✅            | ci.yml                   | ✅ 跳级标题（MD001）→ 红                    |
| YAML lint                                 | `yamllint`                         | ✅            | security.yml             | ✅ 非法 YAML → 红                           |
| 依赖漏洞                                  | `pnpm audit --audit-level=high`    | `make supply` | security.yml             | 正向通过；负向需 registry，建远端后 CI 实证 |
| 许可证 allowlist                          | `pnpm license:check`               | `make supply` | security.yml             | ✅ 伪造 GPL-3.0 依赖清单 → 红               |
| SBOM                                      | `pnpm sbom:generate`               | `make supply` | security.yml（artifact） | 正向通过；fail-closed 自检已实现            |
| SAST（CodeQL）                            | workflow                           | -             | codeql.yml               | 需远端仓库，建仓后首次运行实证              |

## 触发矩阵（新增形态时补）

| 新增形态          | 必须补的门禁                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Prisma 模型/迁移  | `prisma migrate deploy` 空库演练、schema 漂移检查（`migrate diff --exit-code`）、迁移只增不改审查 |
| OpenAPI/契约      | 契约重生成后 `git diff --exit-code`，PR 加 oasdiff                                                |
| 前端页面          | Playwright + axe（serious/critical）、bundle size 预算（实测 + 3–5%）、stylelint                  |
| 消息队列/定时任务 | 幂等与重放测试；消费者契约测试                                                                    |
| 发布镜像          | hadolint + trivy image（HIGH/CRITICAL，`--ignore-unfixed`）+ 基础镜像钉 sha256                    |
| Rust/WASM 扩展    | rustfmt、clippy `-D warnings`、cargo-deny、llvm-cov 下限                                          |

## 平台侧（建 GitHub 远端后）

- 分支保护：`secrets`、`dependencies`、`workflows`、`codeql`、`quality` 设为 required。
- 必须按首跑展开后的真实 job 名设置，禁止猜名字。
- CodeQL 首次运行后再设 required；私库免费版不支持分支保护时，如实记录为纸面状态。

## 抑制纪律

- 当前无 `eslint-disable`；仅两处有意豁免并有注释：knip `ignoreDependencies`
  跳过 `pino-pretty`（transport 字符串引用，非 import）、gitleaks allowlist
  放过 tests/fixtures 与 docs 图片。
- 新增抑制必须写原因、负责人、到期日；到期未复审即视为门禁失效。
- 供应链 overrides 的每条原因写在 `pnpm-workspace.yaml` 注释中，升级后重跑全部门禁。
