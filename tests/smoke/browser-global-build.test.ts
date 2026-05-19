import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('browser global build', () => {
  it('exposes PdfCompress on the global object', async () => {
    const source = await readFile(
      join(process.cwd(), 'dist', 'pdf-compress.global.js'),
      'utf8',
    );

    const runtime = new Function('globalThis', `${source}; return globalThis.PdfCompress;`);
    const namespace = runtime({});

    expect(namespace).toBeTruthy();
    expect(typeof namespace.compressPdf).toBe('function');
  });
});
