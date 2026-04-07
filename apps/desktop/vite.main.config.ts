import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main/index.ts',
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    outDir: 'out/main',
    rollupOptions: {
      external: ['electron'],
    },
  },
});
