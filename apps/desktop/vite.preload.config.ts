import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/preload/index.ts',
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    outDir: 'out/preload',
    rollupOptions: {
      external: ['electron'],
    },
  },
});
