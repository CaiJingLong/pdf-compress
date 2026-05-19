import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { compressPdfFile } from '../../src/node';

const samplePdfUrl = new URL('../../assets/samples/sample-images.pdf', import.meta.url);

describe('compressPdfFile', () => {
  it('writes a compressed pdf to the requested output path', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'pdf-compress-'));
    const outputPath = join(outputDir, 'sample-images.compressed.pdf');
    const inputPath = fileURLToPath(samplePdfUrl);

    const result = await compressPdfFile(inputPath, {
      outputPath,
      quality: 0.83,
      maxWidth: 1800,
      maxHeight: 1800,
    });

    const outputBytes = await readFile(outputPath);
    const inputBytes = await readFile(samplePdfUrl);

    expect(result.outputPath).toBe(outputPath);
    expect(outputBytes.length).toBe(result.summary.compressedBytes);
    expect(outputBytes.length).toBeGreaterThan(0);
    expect(result.summary.originalBytes).toBe(inputBytes.length);
  });
});
