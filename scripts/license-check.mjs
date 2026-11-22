// 生产依赖许可证白名单（分发合规）。单包仓：pnpm licenses list --prod。
import { spawnSync } from 'node:child_process';

const allowed = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BlueOak-1.0.0',
  'CC0-1.0',
  'ISC',
  'MIT',
  'MIT-0',
  'MPL-2.0',
  'PSF-2.0',
  'Python-2.0',
  'Unlicense',
  'Zlib',
]);

const aliases = new Map([['Apache 2.0', 'Apache-2.0']]);

function isAllowed(expression) {
  let normalized = expression;
  for (const [from, to] of aliases) {
    normalized = normalized.replaceAll(from, to);
  }
  const atoms = normalized
    .replace(/[()]/g, ' ')
    .split(/\s+/)
    .filter((token) => token !== '' && !['AND', 'OR', 'WITH'].includes(token.toUpperCase()));
  return atoms.length > 0 && atoms.every((atom) => allowed.has(atom));
}

const pnpmCli = process.env['npm_execpath'];
if (pnpmCli === undefined) {
  console.error('license:check 需经 pnpm 脚本运行（npm_execpath 缺失）');
  process.exit(2);
}
const pnpmCommand = /\.[cm]?js$/.test(pnpmCli)
  ? { command: process.execPath, prefix: [pnpmCli] }
  : { command: pnpmCli, prefix: [] };

const result = spawnSync(
  pnpmCommand.command,
  [...pnpmCommand.prefix, 'licenses', 'list', '--prod', '--json'],
  {
    encoding: 'utf8',
  },
);
if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(1);
}

let failed = false;
const grouped = JSON.parse(result.stdout);
for (const [license, packages] of Object.entries(grouped)) {
  if (isAllowed(license)) continue;
  failed = true;
  const names = packages.map((p) => `${p.name}@${p.versions.join(',')}`).join(', ');
  console.error(`非白名单许可证 ${license}: ${names}`);
}

if (failed) {
  console.error('许可证检查未通过：新增依赖需先确认许可证并更新 scripts/license-check.mjs 白名单');
  process.exit(1);
}
console.log('许可证检查通过（仅生产依赖）');
