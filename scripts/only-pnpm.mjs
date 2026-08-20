const userAgent = process.env.npm_config_user_agent ?? '';

if (!userAgent.startsWith('pnpm/')) {
  console.error('\nOpenMap 使用 pnpm workspace，请运行：pnpm install\n');
  process.exit(1);
}
