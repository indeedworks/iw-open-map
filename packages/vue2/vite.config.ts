import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: { entry: 'src/index.ts', name: 'OpenMapVue2', cssFileName: 'iw-open-map-vue2', formats: ['es', 'cjs', 'iife'], fileName: (format) => `iw-open-map-vue2.${format === 'es' ? 'js' : format === 'cjs' ? 'cjs' : 'iife.js'}` },
    sourcemap: true,
    rollupOptions: { external: ['vue', '@indeedworks/open-map'], output: { globals: { vue: 'Vue', '@indeedworks/open-map': 'OpenMapSDK' } } }
  }
});
