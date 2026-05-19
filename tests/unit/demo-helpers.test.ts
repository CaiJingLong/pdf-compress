import { describe, expect, it } from 'vitest';
import {
  clampPositiveInt,
  createCompressionSummary,
  createResultViewModel as createDashboardResultViewModel,
  formatBytes,
  getDefaultExampleOptions,
} from '../../examples/shared/example-helpers.js';

describe('formatBytes', () => {
  it('formats bytes into a readable MB string', () => {
    expect(formatBytes(12_351_974)).toBe('11.78 MB');
  });
});

describe('clampPositiveInt', () => {
  it('returns the fallback for invalid numbers', () => {
    expect(clampPositiveInt('abc', 1800)).toBe(1800);
    expect(clampPositiveInt('-2', 1800)).toBe(1800);
  });

  it('normalizes positive integer text input', () => {
    expect(clampPositiveInt('2048', 1800)).toBe(2048);
  });
});

describe('createCompressionSummary', () => {
  it('normalizes the core compression numbers used by both demo pages', () => {
    expect(
      createCompressionSummary({
        inputBytes: 12_351_974,
        outputBytes: 6_306_434,
        summary: {
          totalImages: 30,
          compressedImages: 15,
          skippedImages: 15,
        },
      }),
    ).toEqual({
      inputBytesText: '11.78 MB',
      outputBytesText: '6.01 MB',
      savedBytesText: '5.77 MB',
      ratioText: '48.9%',
      totalImagesText: '30',
      compressedImagesText: '15',
      skippedImagesText: '15',
      isSmaller: true,
    });
  });
});

describe('createResultViewModel', () => {
  it('returns a success summary before download when output is smaller', () => {
    const viewModel = createDashboardResultViewModel({
      fileName: 'sample.pdf',
      inputBytes: 12_351_974,
      outputBytes: 6_306_434,
      summary: {
        totalImages: 30,
        compressedImages: 15,
        skippedImages: 15,
      },
    });

    expect(viewModel.statusTone).toBe('success');
    expect(viewModel.statusText).toContain('sample.pdf');
    expect(viewModel.metricCards[1]).toEqual({ label: 'Output Size', value: '6.01 MB' });
  });

  it('warns when the compressed result is not smaller', () => {
    const viewModel = createDashboardResultViewModel({
      fileName: 'sample.pdf',
      inputBytes: 12_351_974,
      outputBytes: 12_351_974,
      summary: {
        totalImages: 30,
        compressedImages: 0,
        skippedImages: 30,
      },
    });

    expect(viewModel.statusTone).toBe('warning');
    expect(viewModel.statusText).toContain('did not become smaller');
  });
});

describe('getDefaultDemoOptions', () => {
  it('matches the demo defaults shown in the form', () => {
    expect(getDefaultExampleOptions()).toEqual({
      quality: 0.83,
      maxWidth: 1800,
      maxHeight: 1800,
    });
  });
});

describe('download-before-link behavior', () => {
  it('keeps the metrics available before the download button is rendered', () => {
    const viewModel = createDashboardResultViewModel({
      fileName: 'sample.pdf',
      inputBytes: 12_351_974,
      outputBytes: 6_306_434,
      summary: {
        totalImages: 30,
        compressedImages: 15,
        skippedImages: 15,
      },
    });

    expect(viewModel.metricCards[0]).toEqual({ label: 'Original Size', value: '11.78 MB' });
    expect(viewModel.metricCards[1]).toEqual({ label: 'Output Size', value: '6.01 MB' });
    expect(viewModel.downloadLabel).toBe('Download Compressed PDF');
  });
});
