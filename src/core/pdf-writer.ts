import { PDFDocument, PDFName } from 'pdf-lib';
import type { PdfImageCandidate } from './pdf-parser';
import type { CompressedPdfImage } from './image-compressor';

const TYPE = PDFName.of('Type');
const SUBTYPE = PDFName.of('Subtype');
const FILTER = PDFName.of('Filter');
const WIDTH = PDFName.of('Width');
const HEIGHT = PDFName.of('Height');
const COLOR_SPACE = PDFName.of('ColorSpace');
const BITS_PER_COMPONENT = PDFName.of('BitsPerComponent');

const REPLACED_KEYS = new Set([
  '/Length',
  '/Filter',
  '/Width',
  '/Height',
  '/ColorSpace',
  '/BitsPerComponent',
  '/DecodeParms',
  '/Mask',
  '/SMask',
]);

export function replaceImageStreams(
  pdfDoc: PDFDocument,
  originalImages: PdfImageCandidate[],
  replacements: CompressedPdfImage[],
): void {
  const replacementMap = new Map(replacements.map((item) => [item.imageId, item]));

  for (const image of originalImages) {
    const replacement = replacementMap.get(image.refString);
    if (!replacement) {
      continue;
    }

    const nextStream = pdfDoc.context.stream(replacement.bytes);

    for (const [key, value] of image.stream.dict.entries()) {
      if (REPLACED_KEYS.has(String(key))) {
        continue;
      }

      nextStream.dict.set(key, value);
    }

    nextStream.dict.set(TYPE, PDFName.of('XObject'));
    nextStream.dict.set(SUBTYPE, PDFName.of('Image'));
    nextStream.dict.set(FILTER, PDFName.of('DCTDecode'));
    nextStream.dict.set(WIDTH, pdfDoc.context.obj(replacement.compressedWidth));
    nextStream.dict.set(HEIGHT, pdfDoc.context.obj(replacement.compressedHeight));
    nextStream.dict.set(COLOR_SPACE, PDFName.of('DeviceRGB'));
    nextStream.dict.set(BITS_PER_COMPONENT, pdfDoc.context.obj(8));

    pdfDoc.context.assign(image.ref, nextStream);
  }
}
