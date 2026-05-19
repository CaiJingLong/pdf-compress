import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('release workflow', () => {
  it('publishes from GitHub Releases using trusted publishing', () => {
    const workflow = readFileSync(
      join(process.cwd(), '.github', 'workflows', 'release.yml'),
      'utf8',
    );

    expect(workflow).toContain('release:');
    expect(workflow).toContain('types: [published]');
    expect(workflow).toContain('id-token: write');
    expect(workflow).toContain('npm publish --access public');
    expect(workflow).not.toContain('NPM_TOKEN');
    expect(workflow).toContain('github.event.release.tag_name');
    expect(workflow).toContain('actions/checkout@v6');
    expect(workflow).toContain('actions/setup-node@v6');
    expect(workflow).toContain('node-version: 24');
    expect(workflow).toContain('package-manager-cache: false');
    expect(workflow).toContain('bun run build');
    expect(workflow).toContain('bun test');
    expect(workflow).toContain('bun run typecheck');
  });
});
