process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DATABASE_URL ??=
  'postgresql://node_scaffold:node_scaffold_dev@127.0.0.1:5433/node_scaffold';
