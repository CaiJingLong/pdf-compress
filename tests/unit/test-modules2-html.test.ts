import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const htmlPath = new URL('../../examples/browser-global/index.html', import.meta.url);

describe('test-modules2.html', () => {
  it('uses the new script entry and exposes the dashboard hook ids', async () => {
    const html = await readFile(htmlPath, 'utf8');

    expect(html).toContain('id="file-input"');
    expect(html).toContain('id="load-sample"');
    expect(html).toContain('id="compress"');
    expect(html).toContain('id="quality-input"');
    expect(html).toContain('id="quality-value"');
    expect(html).toContain('id="max-width-input"');
    expect(html).toContain('id="max-height-input"');
    expect(html).toContain('id="status"');
    expect(html).toContain('id="cards"');
    expect(html).toContain('id="details"');
    expect(html).toContain('id="download"');
    expect(html).toContain('../../dist/pdf-compress.global.js');
    expect(html).toContain('Browser Global Example');
  });
});
