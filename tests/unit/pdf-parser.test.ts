import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parsePdfImages } from '../../src/core/pdf-parser';

const samplePdfUrl = new URL('../../assets/samples/sample-images.pdf', import.meta.url);

describe('parsePdfImages', () => {
  it('discovers image xobjects and maps them to page numbers', async () => {
    const bytes = await readFile(samplePdfUrl);
    const parsed = await parsePdfImages(bytes);

    expect(parsed.images.length).toBeGreaterThan(0);
    expect(parsed.images[0]?.filters.length).toBeGreaterThan(0);
    expect(parsed.images[0]?.pageNumbers.length).toBeGreaterThan(0);
    expect(parsed.images[0]?.width).toBeGreaterThan(0);
    expect(parsed.images[0]?.height).toBeGreaterThan(0);
  });
});
