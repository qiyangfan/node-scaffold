import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // esbuild 不支持 emitDecoratorMetadata，NestJS DI 依赖装饰器元数据，走 swc 转译
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts', 'test/**/*.test.ts'],
    setupFiles: ['test/setup/env.ts'],
    testTimeout: 30_000,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text-summary'],
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', '**/*.module.ts', '**/*.d.ts'],
      thresholds: { statements: 60, branches: 50, functions: 60, lines: 60 },
    },
  },
});
