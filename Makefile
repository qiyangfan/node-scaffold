.PHONY: setup dev build gates lint test supply infra-lint markdownlint db-up db-down

setup:
	pnpm install
	@if command -v uvx >/dev/null 2>&1; then uvx pre-commit@4.0.0 install --install-hooks; else echo "[setup] uvx 未安装,跳过 pre-commit hooks(CI 仍执行全部门禁)"; fi

dev:
	pnpm dev

build:
	pnpm build

lint:
	pnpm lint
	pnpm format:check
	pnpm typecheck
	pnpm lint:arch
	pnpm lint:dead
	pnpm dup:check
	@if command -v gitleaks >/dev/null 2>&1; then gitleaks dir . --redact --exit-code 1; else echo "[secrets] gitleaks 未安装,跳过"; fi
	$(MAKE) markdownlint
	$(MAKE) infra-lint

markdownlint:
	npx --yes markdownlint-cli2@0.24.1

infra-lint:
	@if command -v actionlint >/dev/null 2>&1; then actionlint; else echo "[infra-lint] actionlint 未安装,跳过"; fi
	@if command -v hadolint >/dev/null 2>&1; then hadolint Dockerfile; else echo "[infra-lint] hadolint 未安装,跳过"; fi
	@if command -v uvx >/dev/null 2>&1; then uvx yamllint==1.38.0 -c .yamllint.yml .github; else echo "[infra-lint] uvx 未安装,跳过 yamllint"; fi

test:
	pnpm test:coverage

gates: lint test build

# 安全与供应链：需要 registry 访问，CI 的 security.yml 同款；本地按需执行。
supply:
	pnpm audit:deps
	pnpm license:check
	pnpm sbom:generate

db-up:
	pnpm db:up

db-down:
	pnpm db:down
