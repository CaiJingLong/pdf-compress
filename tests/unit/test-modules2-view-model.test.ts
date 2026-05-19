import { describe, expect, it } from 'vitest';
import { createResultViewModel } from '../../examples/shared/example-helpers.js';

describe('createDashboardResultViewModel', () => {
  it('builds the success cards and detail rows for the new dashboard layout', () => {
    const viewModel = createResultViewModel({
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
    expect(viewModel.metricCards).toEqual([
      { label: 'Original Size', value: '11.78 MB' },
      { label: 'Output Size', value: '6.01 MB' },
      { label: 'Saved', value: '5.77 MB' },
      { label: 'Reduction', value: '48.9%' },
    ]);
    expect(viewModel.detailItems).toEqual([
      { label: 'Total Images', value: '30' },
      { label: 'Compressed Images', value: '15' },
      { label: 'Skipped Images', value: '15' },
    ]);
    expect(viewModel.downloadLabel).toBe('Download Compressed PDF');
  });

  it('switches to warning tone when the output is not smaller', () => {
    const viewModel = createResultViewModel({
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
