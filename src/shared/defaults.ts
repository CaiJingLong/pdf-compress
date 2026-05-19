import type { CompressPdfOptions, NormalizedCompressPdfOptions } from './types';

export const DEFAULT_COMPRESS_PDF_OPTIONS: NormalizedCompressPdfOptions = {
  quality: 0.83,
  maxWidth: 2000,
  maxHeight: 2000,
  minBytes: 32 * 1024,
  minWidth: 256,
  minHeight: 256,
  skipImagesWithAlpha: true,
  jpegOnly: false,
};

export function normalizeCompressPdfOptions(
  options: CompressPdfOptions = {},
): NormalizedCompressPdfOptions {
  return {
    quality: clamp(options.quality ?? DEFAULT_COMPRESS_PDF_OPTIONS.quality, 0.1, 1),
    maxWidth: Math.max(1, Math.round(options.maxWidth ?? DEFAULT_COMPRESS_PDF_OPTIONS.maxWidth)),
    maxHeight: Math.max(
      1,
      Math.round(options.maxHeight ?? DEFAULT_COMPRESS_PDF_OPTIONS.maxHeight),
    ),
    minBytes: Math.max(0, Math.round(options.minBytes ?? DEFAULT_COMPRESS_PDF_OPTIONS.minBytes)),
    minWidth: Math.max(1, Math.round(options.minWidth ?? DEFAULT_COMPRESS_PDF_OPTIONS.minWidth)),
    minHeight: Math.max(
      1,
      Math.round(options.minHeight ?? DEFAULT_COMPRESS_PDF_OPTIONS.minHeight),
    ),
    skipImagesWithAlpha:
      options.skipImagesWithAlpha ?? DEFAULT_COMPRESS_PDF_OPTIONS.skipImagesWithAlpha,
    jpegOnly: options.jpegOnly ?? DEFAULT_COMPRESS_PDF_OPTIONS.jpegOnly,
    onProgress: options.onProgress,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
