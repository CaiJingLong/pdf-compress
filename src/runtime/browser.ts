import type { ImageRuntime } from './types';

export const browserImageRuntime: ImageRuntime = {
  async encodeJpeg(source, width, height, quality) {
    const canvas = createCanvas(width, height);
    const context = getContext(canvas);

    if (source.kind === 'encoded') {
      const bitmap = await createImageBitmap(
        new Blob([toArrayBuffer(source.bytes)], { type: source.mimeType }),
      );
      context.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
    } else {
      const sourceCanvas = createCanvas(source.width, source.height);
      const sourceContext = getContext(sourceCanvas);
      sourceContext.putImageData(
        new ImageData(new Uint8ClampedArray(source.pixels), source.width, source.height),
        0,
        0,
      );
      context.drawImage(sourceCanvas, 0, 0, width, height);
    }

    return canvasToJpegBytes(canvas, quality);
  },
};

function createCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getContext(
  canvas: OffscreenCanvas | HTMLCanvasElement,
): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
  const context = canvas.getContext('2d') as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;
  if (!context) {
    throw new Error('2d canvas context is unavailable in this browser');
  }

  return context;
}

async function canvasToJpegBytes(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  quality: number,
): Promise<Uint8Array> {
  if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    return new Uint8Array(await blob.arrayBuffer());
  }

  const htmlCanvas = canvas as HTMLCanvasElement;
  const blob = await new Promise<Blob>((resolve, reject) => {
    htmlCanvas.toBlob((value) => {
      if (!value) {
        reject(new Error('canvas.toBlob returned null'));
        return;
      }
      resolve(value);
    }, 'image/jpeg', quality);
  });

  return new Uint8Array(await blob.arrayBuffer());
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}
