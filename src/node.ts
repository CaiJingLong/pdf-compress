import { compressPdfWithRuntime } from './api/compress-pdf';
import { compressPdfFile as compressPdfFileImpl } from './api/compress-pdf-file';
import { nodeImageRuntime } from './runtime/node';
import type { CompressPdfOptions } from './shared/types';

export type {
  CompressPdfFileOptions,
  CompressPdfFileResult,
  CompressPdfOptions,
  CompressPdfResult,
} from './shared/types';

export async function compressPdf(
  input: Uint8Array | ArrayBuffer | Blob,
  options: CompressPdfOptions = {},
) {
  return compressPdfWithRuntime(input, options, nodeImageRuntime);
}

export const compressPdfFile = compressPdfFileImpl;
