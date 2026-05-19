import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFObject,
  PDFRawStream,
  PDFRef,
} from 'pdf-lib';

const SUBTYPE = PDFName.of('Subtype');
const FILTER = PDFName.of('Filter');
const WIDTH = PDFName.of('Width');
const HEIGHT = PDFName.of('Height');
const COLOR_SPACE = PDFName.of('ColorSpace');
const BITS_PER_COMPONENT = PDFName.of('BitsPerComponent');
const DECODE_PARMS = PDFName.of('DecodeParms');
const MASK = PDFName.of('Mask');
const SOFT_MASK = PDFName.of('SMask');
const XOBJECT = PDFName.of('XObject');
const RESOURCES = PDFName.of('Resources');

export interface PdfImageCandidate {
  ref: PDFRef;
  refString: string;
  pageNumbers: number[];
  width: number;
  height: number;
  bitsPerComponent: number | null;
  colorSpace: string | null;
  filters: string[];
  hasAlphaChannel: boolean;
  hasDecodeParms: boolean;
  rawBytes: Uint8Array;
  stream: PDFRawStream;
}

export interface ParsedPdfImages {
  pdfDoc: PDFDocument;
  images: PdfImageCandidate[];
}

export async function parsePdfImages(input: Uint8Array): Promise<ParsedPdfImages> {
  const pdfDoc = await PDFDocument.load(input, { updateMetadata: false });
  const pageMap = collectPageImageRefs(pdfDoc);
  const images: PdfImageCandidate[] = [];

  for (const [ref, object] of pdfDoc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) {
      continue;
    }

    if (String(object.dict.get(SUBTYPE)) !== '/Image') {
      continue;
    }

    const colorSpace = lookupMaybe(object.dict.get(COLOR_SPACE), pdfDoc);
    const filters = lookupMaybe(object.dict.get(FILTER), pdfDoc);

    images.push({
      ref,
      refString: String(ref),
      pageNumbers: pageMap.get(String(ref)) ?? [],
      width: readNumber(object.dict.get(WIDTH)),
      height: readNumber(object.dict.get(HEIGHT)),
      bitsPerComponent: readOptionalNumber(object.dict.get(BITS_PER_COMPONENT)),
      colorSpace: readNameOrArray(colorSpace),
      filters: readNameList(filters),
      hasAlphaChannel: object.dict.has(MASK) || object.dict.has(SOFT_MASK),
      hasDecodeParms: object.dict.has(DECODE_PARMS),
      rawBytes: object.getContents(),
      stream: object,
    });
  }

  return { pdfDoc, images };
}

function collectPageImageRefs(pdfDoc: PDFDocument): Map<string, number[]> {
  const imagePages = new Map<string, number[]>();
  const visitedFormRefs = new Set<string>();

  pdfDoc.getPages().forEach((page, pageIndex) => {
    const resources = page.node.Resources();
    if (!resources) {
      return;
    }

    walkResourceDict(pdfDoc, resources, pageIndex + 1, imagePages, visitedFormRefs);
  });

  return imagePages;
}

function walkResourceDict(
  pdfDoc: PDFDocument,
  resources: PDFDict,
  pageNumber: number,
  imagePages: Map<string, number[]>,
  visitedFormRefs: Set<string>,
): void {
  const xObjects = resources.lookupMaybe(XOBJECT, PDFDict);
  if (!xObjects) {
    return;
  }

  for (const [, value] of xObjects.entries()) {
    if (!(value instanceof PDFRef)) {
      continue;
    }

    const resolved = pdfDoc.context.lookup(value);
    if (!(resolved instanceof PDFRawStream)) {
      continue;
    }

    const subtype = String(resolved.dict.get(SUBTYPE));

    if (subtype === '/Image') {
      const refString = String(value);
      const pages = imagePages.get(refString) ?? [];
      if (!pages.includes(pageNumber)) {
        pages.push(pageNumber);
      }
      imagePages.set(refString, pages);
      continue;
    }

    if (subtype === '/Form') {
      const refString = String(value);
      if (visitedFormRefs.has(refString)) {
        continue;
      }

      visitedFormRefs.add(refString);
      const nestedResources = resolved.dict.lookupMaybe(RESOURCES, PDFDict) ?? resources;
      walkResourceDict(pdfDoc, nestedResources, pageNumber, imagePages, visitedFormRefs);
    }
  }
}

function lookupMaybe(value: PDFObject | undefined, pdfDoc: PDFDocument): PDFObject | undefined {
  if (!value) {
    return undefined;
  }

  return value instanceof PDFRef ? pdfDoc.context.lookup(value) : value;
}

function readNameList(value: PDFObject | undefined): string[] {
  if (!value) {
    return [];
  }

  if (value instanceof PDFArray) {
    return value.asArray().map((entry) => stripPdfName(String(entry)));
  }

  return [stripPdfName(String(value))];
}

function readNameOrArray(value: PDFObject | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof PDFArray) {
    const first = value.get(0);
    return first ? stripPdfName(String(first)) : null;
  }

  return stripPdfName(String(value));
}

function readNumber(value: unknown): number {
  const parsed = Number(String(value));
  if (!Number.isFinite(parsed)) {
    throw new Error(`Expected numeric PDF value, received ${String(value)}`);
  }

  return parsed;
}

function readOptionalNumber(value: unknown): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function stripPdfName(value: string): string {
  return value.startsWith('/') ? value.slice(1) : value;
}
