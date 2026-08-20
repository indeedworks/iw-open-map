import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [vue(), dts({ rollupTypes: true })],
  build: {
    lib: { entry: 'src/index.ts', name: 'OpenMapVue3', cssFileName: 'iw-open-map-vue3', formats: ['es', 'cjs', 'iife'], fileName: (format) => `iw-open-map-vue3.${format === 'es' ? 'js' : format === 'cjs' ? 'cjs' : 'iife.js'}` },
    sourcemap: true,
    rollupOptions: { external: ['vue', '@indeedworks/open-map'], output: { globals: { vue: 'Vue', '@indeedworks/open-map': 'OpenMapSDK' } } }
  }
});
