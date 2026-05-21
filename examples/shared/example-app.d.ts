export declare function createExampleApp(options: {
  samplePdfPath: string;
  loadCompressPdf: () => Promise<
    (
      input: Blob,
      options: {
        quality: number;
        maxWidth: number;
        maxHeight: number;
      },
    ) => Promise<{
      data: Uint8Array;
      summary: {
        totalImages: number;
        compressedImages: number;
        skippedImages: number;
      };
    }>
  >;
}): (root?: Document) => void;
