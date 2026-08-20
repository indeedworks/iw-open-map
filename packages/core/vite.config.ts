import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'OpenMapSDK',
      cssFileName: 'iw-open-map',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => `iw-open-map.${format === 'es' ? 'js' : format === 'cjs' ? 'cjs' : 'iife.js'}`
    },
    sourcemap: true,
    rollupOptions: {
      external: ['maplibre-gl', '@turf/turf'],
      output: {
        globals: { 'maplibre-gl': 'maplibregl', '@turf/turf': 'turf' }
      }
    }
  }
});
