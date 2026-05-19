import { compressPdfWithRuntime } from './api/compress-pdf';
import { browserImageRuntime } from './runtime/browser';
import type { CompressPdfOptions } from './shared/types';

export type { CompressPdfOptions, CompressPdfResult } from './shared/types';

export async function compressPdf(
  input: Uint8Array | ArrayBuffer | Blob,
  options: CompressPdfOptions = {},
) {
  return compressPdfWithRuntime(input, options, browserImageRuntime);
}
