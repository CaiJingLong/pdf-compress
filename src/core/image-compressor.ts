import { decodePDFRawStream } from 'pdf-lib';
import type { PdfImageCandidate } from './pdf-parser';
import type { CompressedImageInfo, NormalizedCompressPdfOptions } from '../shared/types';
import type { ImageRuntime, RuntimeImageSource } from '../runtime/types';

export interface CompressedPdfImage extends CompressedImageInfo {
  status: 'compressed';
  bytes: Uint8Array;
}

export type ImageCompressionResult = CompressedPdfImage | CompressedImageInfo;

export function constrainDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function expandSamplesToRgba(
  samples: Uint8Array,
  width: number,
  height: number,
  colorSpace: string,
): Uint8ClampedArray {
  const pixelCount = width * height;
  const pixels = new Uint8ClampedArray(pixelCount * 4);

  if (colorSpace === 'DeviceGray') {
    for (let index = 0; index < pixelCount; index += 1) {
      const value = samples[index] ?? 0;
      const offset = index * 4;
      pixels[offset] = value;
      pixels[offset + 1] = value;
      pixels[offset + 2] = value;
      pixels[offset + 3] = 255;
    }
    return pixels;
  }

  for (let index = 0; index < pixelCount; index += 1) {
    const offset = index * 4;
    const sampleOffset = index * 3;
    pixels[offset] = samples[sampleOffset] ?? 0;
    pixels[offset + 1] = samples[sampleOffset + 1] ?? 0;
    pixels[offset + 2] = samples[sampleOffset + 2] ?? 0;
    pixels[offset + 3] = 255;
  }

  return pixels;
}

export async function compressPdfImage(
  candidate: PdfImageCandidate,
  options: NormalizedCompressPdfOptions,
  runtime: ImageRuntime,
): Promise<ImageCompressionResult> {
  if (
    candidate.width < options.minWidth ||
    candidate.height < options.minHeight ||
    candidate.rawBytes.length < options.minBytes
  ) {
    return createSkippedResult(candidate, 'too-small');
  }

  if (options.skipImagesWithAlpha && candidate.hasAlphaChannel) {
    return createSkippedResult(candidate, 'alpha-channel');
  }

  if (options.jpegOnly && !candidate.filters.includes('DCTDecode')) {
    return createSkippedResult(candidate, 'unsupported-filter');
  }

  const source = createRuntimeImageSource(candidate);
  if (!source) {
    return createSkippedResult(candidate, 'unsupported-filter');
  }

  const { width, height } = constrainDimensions(
    candidate.width,
    candidate.height,
    options.maxWidth,
    options.maxHeight,
  );

  let jpegBytes: Uint8Array;
  try {
    jpegBytes = await runtime.encodeJpeg(source, width, height, options.quality);
  } catch {
    return createSkippedResult(candidate, 'encode-failed');
  }

  if (jpegBytes.length >= candidate.rawBytes.length) {
    return createSkippedResult(candidate, 'not-smaller');
  }

  return {
    imageId: candidate.refString,
    pageNumbers: candidate.pageNumbers,
    originalBytes: candidate.rawBytes.length,
    compressedBytes: jpegBytes.length,
    originalWidth: candidate.width,
    originalHeight: candidate.height,
    compressedWidth: width,
    compressedHeight: height,
    status: 'compressed',
    bytes: jpegBytes,
  };
}

function createRuntimeImageSource(candidate: PdfImageCandidate): RuntimeImageSource | null {
  const isPlainJpeg = candidate.filters.length === 1 && candidate.filters[0] === 'DCTDecode';
  if (isPlainJpeg) {
    return {
      kind: 'encoded',
      mimeType: 'image/jpeg',
      bytes: candidate.rawBytes,
      width: candidate.width,
      height: candidate.height,
    };
  }

  const isPlainFlate = candidate.filters.length === 1 && candidate.filters[0] === 'FlateDecode';
  const colorSpace = candidate.colorSpace ?? 'DeviceRGB';

  if (!isPlainFlate || candidate.bitsPerComponent !== 8 || candidate.hasDecodeParms) {
    return null;
  }

  if (colorSpace !== 'DeviceRGB' && colorSpace !== 'DeviceGray') {
    return null;
  }

  try {
    const decoded = decodePDFRawStream(candidate.stream).decode();
    return {
      kind: 'rgba',
      pixels: expandSamplesToRgba(decoded, candidate.width, candidate.height, colorSpace),
      width: candidate.width,
      height: candidate.height,
    };
  } catch {
    return null;
  }
}

function createSkippedResult(
  candidate: PdfImageCandidate,
  reason: CompressedImageInfo['reason'],
): CompressedImageInfo {
  return {
    imageId: candidate.refString,
    pageNumbers: candidate.pageNumbers,
    originalBytes: candidate.rawBytes.length,
    compressedBytes: candidate.rawBytes.length,
    originalWidth: candidate.width,
    originalHeight: candidate.height,
    compressedWidth: candidate.width,
    compressedHeight: candidate.height,
    status: 'skipped',
    reason,
  };
}
