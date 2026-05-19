import { describe, expect, it, vi } from 'vitest';
import {
  compressPdfImage,
  constrainDimensions,
  expandSamplesToRgba,
} from '../../src/core/image-compressor';
import { normalizeCompressPdfOptions } from '../../src/shared/defaults';
import type { PdfImageCandidate } from '../../src/core/pdf-parser';
import type { ImageRuntime } from '../../src/runtime/types';

function createCandidate(overrides: Partial<PdfImageCandidate> = {}): PdfImageCandidate {
  return {
    ref: {} as PdfImageCandidate['ref'],
    refString: '7 0 R',
    pageNumbers: [1],
    width: 3200,
    height: 2400,
    bitsPerComponent: 8,
    colorSpace: 'DeviceRGB',
    filters: ['DCTDecode'],
    hasAlphaChannel: false,
    hasDecodeParms: false,
    rawBytes: new Uint8Array(600_000),
    stream: {} as PdfImageCandidate['stream'],
    ...overrides,
  };
}

describe('constrainDimensions', () => {
  it('keeps aspect ratio while fitting max bounds', () => {
    expect(constrainDimensions(3200, 2400, 2000, 2000)).toEqual({
      width: 2000,
      height: 1500,
    });
  });
});

describe('expandSamplesToRgba', () => {
  it('converts DeviceGray samples into RGBA pixels', () => {
    expect(Array.from(expandSamplesToRgba(new Uint8Array([128]), 1, 1, 'DeviceGray'))).toEqual([
      128, 128, 128, 255,
    ]);
  });
});

describe('compressPdfImage', () => {
  it('skips images that are below configured thresholds', async () => {
    const runtime: ImageRuntime = {
      encodeJpeg: vi.fn(async () => new Uint8Array([1, 2, 3])),
    };

    const result = await compressPdfImage(
      createCandidate({ width: 120, height: 120, rawBytes: new Uint8Array(20_000) }),
      normalizeCompressPdfOptions({}),
      runtime,
    );

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'too-small',
    });
  });

  it('returns a compressed result when the runtime output is smaller', async () => {
    const runtime: ImageRuntime = {
      encodeJpeg: vi.fn(async () => new Uint8Array(150_000)),
    };

    const result = await compressPdfImage(
      createCandidate(),
      normalizeCompressPdfOptions({ quality: 0.83 }),
      runtime,
    );

    expect(result).toMatchObject({
      status: 'compressed',
      compressedBytes: 150_000,
      compressedWidth: 2000,
      compressedHeight: 1500,
    });
  });

  it('skips flate images that rely on decode parameters', async () => {
    const runtime: ImageRuntime = {
      encodeJpeg: vi.fn(async () => new Uint8Array(150_000)),
    };

    const result = await compressPdfImage(
      createCandidate({
        filters: ['FlateDecode'],
        hasDecodeParms: true,
      }),
      normalizeCompressPdfOptions({}),
      runtime,
    );

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'unsupported-filter',
    });
  });
});
