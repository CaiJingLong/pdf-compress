import type { BinaryInput } from './types';

export async function toUint8Array(input: BinaryInput): Promise<Uint8Array> {
  if (input instanceof Uint8Array) {
    return input;
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  if (input instanceof Blob) {
    return new Uint8Array(await input.arrayBuffer());
  }

  throw new TypeError('Unsupported PDF input type');
}
