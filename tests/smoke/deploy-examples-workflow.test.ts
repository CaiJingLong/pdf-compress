import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('deploy examples workflow', () => {
  it('publishes built browser examples to the gh-pages branch', () => {
    const workflowPath = join(process.cwd(), '.github', 'workflows', 'deploy-examples.yml');

    expect(existsSync(workflowPath)).toBe(true);

    const workflow = readFileSync(workflowPath, 'utf8');

    expect(workflow).toContain('name: Deploy Examples');
    expect(workflow).toContain('branches: [main]');
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('contents: write');
    expect(workflow).toContain('oven-sh/setup-bun@v2');
    expect(workflow).toContain('actions/setup-node@v6');
    expect(workflow).toContain('node-version: 24');
    expect(workflow).toContain('bun install --frozen-lockfile');
    expect(workflow).toContain('bun run build');
    expect(workflow).toContain('bun test');
    expect(workflow).toContain('bun run typecheck');
    expect(workflow).toContain('examples/browser-global');
    expect(workflow).toContain('examples/browser-esm');
    expect(workflow).toContain('examples/shared');
    expect(workflow).toContain('assets/samples');
    expect(workflow).toContain('dist/browser.js');
    expect(workflow).toContain('dist/pdf-compress.global.js');
    expect(workflow).toContain('.nojekyll');
    expect(workflow).toContain('gh-pages');
    expect(workflow).toContain('github-actions[bot]');
    expect(workflow).toContain('git push --force origin HEAD:gh-pages');
  });
});
