# @caijinglong/pdf-compress

Compress image-heavy PDF files in Node.js and modern browsers without rasterizing the whole page.

## Features

- Preserve text, fonts, and vector content whenever possible
- Re-encode embedded bitmap images inside the PDF
- Support Node.js, browser ESM, and browser global script usage
- Ship a single-file browser bundle at `dist/pdf-compress.global.js`

## Limits

- Designed for image-heavy PDFs, not full document optimization
- Focuses on bitmap image streams, not fonts or vector simplification
- May skip unsupported image filters, alpha-heavy images, or unsafe replacements
- Returns the original PDF bytes if the recompressed result is not smaller

## Installation

```bash
/Users/cai/.bun/bin/bun add @caijinglong/pdf-compress
```

## Node Usage

Compress from a file path:

```ts
import { compressPdfFile } from '@caijinglong/pdf-compress/node';

const result = await compressPdfFile('./assets/samples/sample-images.pdf', {
  quality: 0.83,
  maxWidth: 1800,
  maxHeight: 1800,
});

console.log(result.outputPath);
console.log(result.summary);
```

Compress from binary input:

```ts
import { readFile } from 'node:fs/promises';
import { compressPdf } from '@caijinglong/pdf-compress/node';

const input = await readFile('./assets/samples/sample-images.pdf');
const result = await compressPdf(input, {
  quality: 0.83,
  maxWidth: 1800,
  maxHeight: 1800,
});

console.log(result.summary);
```

## Browser ESM Usage

```ts
import { compressPdf } from '@caijinglong/pdf-compress/browser';

const result = await compressPdf(file, {
  quality: 0.83,
  maxWidth: 1800,
  maxHeight: 1800,
});
```

## Browser Global Usage

```html
<script src="https://cdn.jsdelivr.net/npm/@caijinglong/pdf-compress/dist/pdf-compress.global.js"></script>
```

```js
const result = await window.PdfCompress.compressPdf(file, {
  quality: 0.83,
  maxWidth: 1800,
  maxHeight: 1800,
});
```

## CDN ESM Usage

```ts
import { compressPdf } from 'https://esm.sh/@caijinglong/pdf-compress/browser';
```

## Examples

- Browser global example: [examples/browser-global/index.html](/Users/cai/code/web/pdf-compress/examples/browser-global/index.html:1)
- Browser ESM example: [examples/browser-esm/index.html](/Users/cai/code/web/pdf-compress/examples/browser-esm/index.html:1)
- Public sample PDF and attribution: [assets/samples/README.md](/Users/cai/code/web/pdf-compress/assets/samples/README.md:1)

After building the package, preview them with a static file server:

```bash
/Users/cai/.bun/bin/bun run build
/Users/cai/.bun/bin/bun run serve
```

Then open:

```text
http://127.0.0.1:4884/examples/browser-global/
http://127.0.0.1:4884/examples/browser-esm/
```

## API Result Shape

```ts
interface CompressPdfResult {
  data: Uint8Array;
  summary: {
    originalBytes: number;
    compressedBytes: number;
    savedBytes: number;
    ratio: number;
    totalImages: number;
    compressedImages: number;
    skippedImages: number;
  };
  images: Array<{
    imageId: string;
    pageNumbers: number[];
    originalBytes: number;
    compressedBytes: number;
    originalWidth: number;
    originalHeight: number;
    compressedWidth: number;
    compressedHeight: number;
    status: 'compressed' | 'skipped';
    reason?:
      | 'too-small'
      | 'alpha-channel'
      | 'unsupported-filter'
      | 'decode-failed'
      | 'not-smaller'
      | 'unsafe-object'
      | 'encode-failed';
  }>;
}
```

## Default Options

- `quality: 0.83`
- `maxWidth: 2000`
- `maxHeight: 2000`
- `minBytes: 32768`
- `minWidth: 256`
- `minHeight: 256`
- `skipImagesWithAlpha: true`
- `jpegOnly: false`

## Development

```bash
/Users/cai/.bun/bin/bun install
/Users/cai/.bun/bin/bun run build
/Users/cai/.bun/bin/bun test
/Users/cai/.bun/bin/bun run typecheck
```

## Package Contents

Published package contents are limited to:

- `dist/`
- `README.md`
- `LICENSE`
