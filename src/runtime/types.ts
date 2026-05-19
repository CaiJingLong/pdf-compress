export interface EncodedImageSource {
  kind: 'encoded';
  mimeType: 'image/jpeg' | 'image/png';
  bytes: Uint8Array;
  width: number;
  height: number;
}

export interface RgbaImageSource {
  kind: 'rgba';
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
}

export type RuntimeImageSource = EncodedImageSource | RgbaImageSource;

export interface ImageRuntime {
  encodeJpeg(
    source: RuntimeImageSource,
    width: number,
    height: number,
    quality: number,
  ): Promise<Uint8Array>;
}
