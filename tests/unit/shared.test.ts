import { describe, expect, it } from 'vitest';
import { normalizeCompressPdfOptions } from '../../src/shared/defaults';
import { toUint8Array } from '../../src/shared/binary';

describe('normalizeCompressPdfOptions', () => {
  it('fills the documented defaults', () => {
    expect(normalizeCompressPdfOptions({})).toMatchObject({
      quality: 0.83,
      maxWidth: 2000,
      maxHeight: 2000,
      minBytes: 32 * 1024,
      minWidth: 256,
      minHeight: 256,
      skipImagesWithAlpha: true,
      jpegOnly: false,
    });
  });

  it('clamps quality and preserves explicit caller overrides', () => {
    expect(
      normalizeCompressPdfOptions({
        quality: 99,
        maxWidth: 1200,
        minWidth: 400,
      }),
    ).toMatchObject({
      quality: 1,
      maxWidth: 1200,
      minWidth: 400,
    });
  });
});

describe('toUint8Array', () => {
  it('returns the original Uint8Array reference', async () => {
    const input = new Uint8Array([1, 2, 3]);
    expect(await toUint8Array(input)).toBe(input);
  });

  it('converts ArrayBuffer and Blob inputs', async () => {
    const arrayBuffer = Uint8Array.from([4, 5, 6]).buffer;
    const blob = new Blob([Uint8Array.from([7, 8, 9])], { type: 'application/pdf' });

    expect(Array.from(await toUint8Array(arrayBuffer))).toEqual([4, 5, 6]);
    expect(Array.from(await toUint8Array(blob))).toEqual([7, 8, 9]);
  });
});
