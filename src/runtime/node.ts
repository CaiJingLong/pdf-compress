import { createCanvas, ImageData, loadImage } from '@napi-rs/canvas';
import type { ImageRuntime } from './types';

export const nodeImageRuntime: ImageRuntime = {
  async encodeJpeg(source, width, height, quality) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    if (source.kind === 'encoded') {
      const image = await loadImage(Buffer.from(source.bytes));
      context.drawImage(image, 0, 0, width, height);
    } else {
      const sourceCanvas = createCanvas(source.width, source.height);
      const sourceContext = sourceCanvas.getContext('2d');
      sourceContext.putImageData(new ImageData(source.pixels, source.width, source.height), 0, 0);
      context.drawImage(sourceCanvas, 0, 0, width, height);
    }

    return new Uint8Array(await canvas.encode('jpeg', Math.round(quality * 100)));
  },
};
