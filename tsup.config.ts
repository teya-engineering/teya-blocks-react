import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: {
    preset: 'recommended',
    moduleSideEffects: false,
  },
  minify: true,
  external: ['react', 'react-dom', '@teyaproduct/teya-blocks-js'],
});
