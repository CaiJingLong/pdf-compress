import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';
import { compressPdfWithRuntime } from './compress-pdf';
import { nodeImageRuntime } from '../runtime/node';
import type { CompressPdfFileOptions, CompressPdfFileResult } from '../shared/types';

export async function compressPdfFile(
  inputPath: string,
  options: CompressPdfFileOptions = {},
): Promise<CompressPdfFileResult> {
  const inputBytes = await readFile(inputPath);
  const result = await compressPdfWithRuntime(inputBytes, options, nodeImageRuntime);
  const outputPath = options.outputPath ?? createDefaultOutputPath(inputPath);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, result.data);

  return {
    ...result,
    outputPath,
  };
}

function createDefaultOutputPath(inputPath: string): string {
  const parsed = parse(inputPath);
  return join(parsed.dir, `${parsed.name}.compressed${parsed.ext || '.pdf'}`);
}
