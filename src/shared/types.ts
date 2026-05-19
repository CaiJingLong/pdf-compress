export type BinaryInput = Uint8Array | ArrayBuffer | Blob;

export interface CompressProgressEvent {
  phase: 'parse' | 'compress' | 'write';
  processedPages: number;
  totalPages: number;
  processedImages: number;
  totalImages: number;
  currentImageId?: string;
}

export interface CompressPdfOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  minBytes?: number;
  minWidth?: number;
  minHeight?: number;
  skipImagesWithAlpha?: boolean;
  jpegOnly?: boolean;
  onProgress?: (event: CompressProgressEvent) => void;
}

export interface NormalizedCompressPdfOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  minBytes: number;
  minWidth: number;
  minHeight: number;
  skipImagesWithAlpha: boolean;
  jpegOnly: boolean;
  onProgress?: (event: CompressProgressEvent) => void;
}

export interface CompressedImageInfo {
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
}

export interface CompressPdfSummary {
  originalBytes: number;
  compressedBytes: number;
  savedBytes: number;
  ratio: number;
  totalImages: number;
  compressedImages: number;
  skippedImages: number;
}

export interface CompressPdfResult {
  data: Uint8Array;
  summary: CompressPdfSummary;
  images: CompressedImageInfo[];
}

export interface CompressPdfFileOptions extends CompressPdfOptions {
  outputPath?: string;
}

export interface CompressPdfFileResult extends CompressPdfResult {
  outputPath?: string;
}
