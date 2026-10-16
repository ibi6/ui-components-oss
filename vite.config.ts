import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist/lib',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/index.ts',
      name: 'UIComponents',
      fileName: (f) => (f === 'es' ? 'ui-components.js' : f === 'cjs' ? 'ui-components.cjs' : `ui-components.${f}.js`),
      formats: ['es', 'cjs', 'iife'],
    },
  },
  test: { environment: 'happy-dom' },
});
