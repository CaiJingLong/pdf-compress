import { compressPdfImage } from '../core/image-compressor';
import type { CompressedPdfImage, ImageCompressionResult } from '../core/image-compressor';
import { parsePdfImages } from '../core/pdf-parser';
import { replaceImageStreams } from '../core/pdf-writer';
import { toUint8Array } from '../shared/binary';
import { normalizeCompressPdfOptions } from '../shared/defaults';
import type {
  BinaryInput,
  CompressPdfOptions,
  CompressPdfResult,
  CompressProgressEvent,
} from '../shared/types';
import type { ImageRuntime } from '../runtime/types';

export async function compressPdfWithRuntime(
  input: BinaryInput,
  options: CompressPdfOptions = {},
  runtime: ImageRuntime,
): Promise<CompressPdfResult> {
  const originalBytes = await toUint8Array(input);
  const normalized = normalizeCompressPdfOptions(options);

  emitProgress(normalized.onProgress, {
    phase: 'parse',
    processedPages: 0,
    totalPages: 0,
    processedImages: 0,
    totalImages: 0,
  });

  const { pdfDoc, images } = await parsePdfImages(originalBytes);
  const totalPages = pdfDoc.getPageCount();
  const results: ImageCompressionResult[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    emitProgress(normalized.onProgress, {
      phase: 'compress',
      processedPages: totalPages,
      totalPages,
      processedImages: index,
      totalImages: images.length,
      currentImageId: image.refString,
    });

    results.push(await compressPdfImage(image, normalized, runtime));
  }

  const compressedImages = results.filter(
    (item): item is CompressedPdfImage => item.status === 'compressed',
  );

  if (compressedImages.length === 0) {
    return buildResult(originalBytes, originalBytes, results);
  }

  replaceImageStreams(pdfDoc, images, compressedImages);

  emitProgress(normalized.onProgress, {
    phase: 'write',
    processedPages: totalPages,
    totalPages,
    processedImages: images.length,
    totalImages: images.length,
  });

  const outputBytes = await pdfDoc.save();

  if (outputBytes.length >= originalBytes.length) {
    const revertedResults = results.map((item) =>
      item.status === 'compressed'
        ? {
            ...item,
            status: 'skipped' as const,
            reason: 'not-smaller' as const,
            compressedBytes: item.originalBytes,
            compressedWidth: item.originalWidth,
            compressedHeight: item.originalHeight,
          }
        : item,
    );

    return buildResult(originalBytes, originalBytes, revertedResults);
  }

  return buildResult(originalBytes, outputBytes, results);
}

function buildResult(
  originalBytes: Uint8Array,
  outputBytes: Uint8Array,
  images: ImageCompressionResult[],
): CompressPdfResult {
  const compressedImages = images.filter((item) => item.status === 'compressed').length;

  return {
    data: outputBytes,
    summary: {
      originalBytes: originalBytes.length,
      compressedBytes: outputBytes.length,
      savedBytes: originalBytes.length - outputBytes.length,
      ratio: outputBytes.length / originalBytes.length,
      totalImages: images.length,
      compressedImages,
      skippedImages: images.length - compressedImages,
    },
    images,
  };
}

function emitProgress(
  callback: ((event: CompressProgressEvent) => void) | undefined,
  event: CompressProgressEvent,
): void {
  callback?.(event);
}
