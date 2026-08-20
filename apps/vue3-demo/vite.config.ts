import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/demos/vue3/',
  envDir: fileURLToPath(new URL('../../', import.meta.url)),
  plugins: [vue()]
});
