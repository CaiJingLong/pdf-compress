const DEFAULT_OPTIONS = {
  quality: 0.83,
  maxWidth: 1800,
  maxHeight: 1800,
};

export function getDefaultExampleOptions() {
  return { ...DEFAULT_OPTIONS };
}

export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = Math.max(0, bytes);
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = unitIndex === 0 ? 0 : 2;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

export function clampPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function createCompressionSummary({ inputBytes, outputBytes, summary }) {
  const savedBytes = Math.max(0, inputBytes - outputBytes);
  const ratio = inputBytes === 0 ? 0 : (savedBytes / inputBytes) * 100;

  return {
    inputBytesText: formatBytes(inputBytes),
    outputBytesText: formatBytes(outputBytes),
    savedBytesText: formatBytes(savedBytes),
    ratioText: `${ratio.toFixed(1)}%`,
    totalImagesText: String(summary.totalImages),
    compressedImagesText: String(summary.compressedImages),
    skippedImagesText: String(summary.skippedImages),
    isSmaller: outputBytes < inputBytes,
  };
}

export function createResultViewModel({ fileName, inputBytes, outputBytes, summary }) {
  const compression = createCompressionSummary({ inputBytes, outputBytes, summary });

  return {
    statusTone: compression.isSmaller ? 'success' : 'warning',
    statusText: compression.isSmaller
      ? `${fileName} compressed successfully.`
      : `${fileName} did not become smaller. The original output is returned.`,
    metricCards: [
      { label: 'Original Size', value: compression.inputBytesText },
      { label: 'Output Size', value: compression.outputBytesText },
      { label: 'Saved', value: compression.savedBytesText },
      { label: 'Reduction', value: compression.ratioText },
    ],
    detailItems: [
      { label: 'Total Images', value: compression.totalImagesText },
      { label: 'Compressed Images', value: compression.compressedImagesText },
      { label: 'Skipped Images', value: compression.skippedImagesText },
    ],
    downloadLabel: 'Download Compressed PDF',
  };
}
