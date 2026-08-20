import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/demos/vanilla/',
  envDir: fileURLToPath(new URL('../../', import.meta.url))
});
