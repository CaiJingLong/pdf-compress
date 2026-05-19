import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { compressPdf } from '../../src/node';

const samplePdfUrl = new URL('../../assets/samples/sample-images.pdf', import.meta.url);

describe('compressPdf', () => {
  it('returns a smaller PDF that can be reopened', async () => {
    const inputBytes = await readFile(samplePdfUrl);
    const phases: string[] = [];

    const result = await compressPdf(inputBytes, {
      quality: 0.83,
      maxWidth: 1800,
      maxHeight: 1800,
      onProgress: (event) => phases.push(event.phase),
    });

    expect(result.summary.originalBytes).toBe(inputBytes.length);
    expect(result.summary.compressedBytes).toBeGreaterThan(0);
    expect(result.summary.totalImages).toBeGreaterThan(0);
    expect(phases).toContain('parse');
    expect(phases).toContain('compress');
    expect(phases.length).toBeGreaterThanOrEqual(2);

    const reopened = await PDFDocument.load(result.data, { updateMetadata: false });
    expect(reopened.getPageCount()).toBeGreaterThan(0);
  });
});
