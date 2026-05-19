import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import pkg from '../../package.json' with { type: 'json' };
import { compressPdf, compressPdfFile } from '../../src/node';
import { compressPdf as compressPdfInBrowser } from '../../src/browser';

describe('public api', () => {
  it('exports the Node binary compressor', () => {
    expect(typeof compressPdf).toBe('function');
  });

  it('exports the Node file compressor', () => {
    expect(typeof compressPdfFile).toBe('function');
  });

  it('exports the browser binary compressor', () => {
    expect(typeof compressPdfInBrowser).toBe('function');
  });

  it('uses the scoped publish name and exposes a CDN default entry', () => {
    expect(pkg.name).toBe('@caijinglong/pdf-compress');
    expect(pkg.unpkg).toBe('./dist/pdf-compress.global.js');
    expect(pkg.jsdelivr).toBe('./dist/pdf-compress.global.js');
  });

  it('documents the scoped package and example directories', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');

    expect(readme).toContain('@caijinglong/pdf-compress/node');
    expect(readme).toContain('@caijinglong/pdf-compress/browser');
    expect(readme).toContain('dist/pdf-compress.global.js');
    expect(readme).toContain('examples/browser-global');
    expect(readme).toContain('examples/browser-esm');
  });

  it('links the Chinese README and developer guide from the English README', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');

    expect(readme).toContain('README.zh-CN.md');
    expect(readme).toContain('docs/developer-guide.zh-CN.md');
  });

  it('documents trusted publishing constraints for maintainers', () => {
    const developerGuide = readFileSync(
      join(process.cwd(), 'docs', 'developer-guide.zh-CN.md'),
      'utf8',
    );

    expect(developerGuide).toContain('Trusted Publisher');
    expect(developerGuide).toContain('GitHub-hosted runner');
    expect(developerGuide).toContain('id-token: write');
    expect(developerGuide).toContain('GitHub Release');
    expect(developerGuide).toContain('npm publish --access public');
  });

  it('removes internal-only demo files from the publishable project layout', () => {
    const removedPaths = [
      'test-modules.html',
      'test-modules2.html',
      'test-tesla.html',
      'demo/test-modules.js',
      'demo/test-modules2.js',
      'demo/demo-helpers.js',
      'demo/test-modules.d.ts',
      'demo/test-modules2.d.ts',
      'demo/demo-helpers.d.ts',
      '19131564043785.pdf',
    ];

    for (const relativePath of removedPaths) {
      expect(existsSync(relativePath)).toBe(false);
    }
  });
});
