import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    node: 'src/node.ts',
    browser: 'src/browser.ts',
  },
  noExternal: ['pdf-lib'],
  format: ['esm'],
  dts: true,
  target: 'es2022',
  sourcemap: true,
  clean: true,
  splitting: false,
});
