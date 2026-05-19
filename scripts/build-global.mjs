import { build } from 'esbuild';

await build({
  entryPoints: ['src/browser-global.ts'],
  outfile: 'dist/pdf-compress.global.js',
  bundle: true,
  format: 'iife',
  target: 'es2022',
  platform: 'browser',
  globalName: 'PdfCompressBundle',
  sourcemap: true,
});
