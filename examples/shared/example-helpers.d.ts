export declare function getDefaultExampleOptions(): {
  quality: number;
  maxWidth: number;
  maxHeight: number;
};

export declare function formatBytes(bytes: number): string;
export declare function clampPositiveInt(value: string | number, fallback: number): number;

export declare function createCompressionSummary(input: {
  inputBytes: number;
  outputBytes: number;
  summary: {
    totalImages: number;
    compressedImages: number;
    skippedImages: number;
  };
}): {
  inputBytesText: string;
  outputBytesText: string;
  savedBytesText: string;
  ratioText: string;
  totalImagesText: string;
  compressedImagesText: string;
  skippedImagesText: string;
  isSmaller: boolean;
};

export declare function createResultViewModel(input: {
  fileName: string;
  inputBytes: number;
  outputBytes: number;
  summary: {
    totalImages: number;
    compressedImages: number;
    skippedImages: number;
  };
}): {
  statusTone: 'success' | 'warning';
  statusText: string;
  metricCards: Array<{ label: string; value: string }>;
  detailItems: Array<{ label: string; value: string }>;
  downloadLabel: string;
};
