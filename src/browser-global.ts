import { compressPdf } from './browser';

export type { CompressPdfOptions, CompressPdfResult } from './shared/types';

const namespace = { compressPdf };

if (typeof globalThis === 'object') {
  Object.assign(globalThis, { PdfCompress: namespace });
}

export { compressPdf };
