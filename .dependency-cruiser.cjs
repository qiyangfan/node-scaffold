/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '循环依赖必须消除，不能靠加载顺序掩盖',
      from: {},
      to: { circular: true },
    },
    {
      name: 'config-is-leaf',
      severity: 'error',
      comment: '配置模块只读环境，不依赖任何业务/基础设施模块',
      from: { path: '^src/config' },
      to: { pathNot: '^src/config' },
    },
    {
      name: 'prisma-not-upward',
      severity: 'error',
      comment: '数据访问层不得依赖健康检查或通用协议层',
      from: { path: '^src/prisma' },
      to: { path: '^src/(health|common)' },
    },
    {
      name: 'common-not-upward',
      severity: 'error',
      comment: '通用协议层不得依赖具体业务模块',
      from: { path: '^src/common' },
      to: { path: '^src/(health|prisma)' },
    },
    {
      name: 'health-not-main',
      severity: 'error',
      comment: '健康检查模块不得依赖启动入口',
      from: { path: '^src/health' },
      to: { path: '^src/main' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    exclude: { path: 'node_modules|dist|coverage' },
  },
};
