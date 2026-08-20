import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/demos/vue2/',
  envDir: fileURLToPath(new URL('../../', import.meta.url)),
  plugins: [vue()]
});
