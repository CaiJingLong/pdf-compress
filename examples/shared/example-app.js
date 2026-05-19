import {
  clampPositiveInt,
  createResultViewModel,
  formatBytes,
  getDefaultExampleOptions,
} from './example-helpers.js';

export function createExampleApp({ loadCompressPdf, samplePdfPath }) {
  return function initializeExampleApp(root = document) {
    const fileInput = getElement(root, 'file-input');
    const loadSampleButton = getElement(root, 'load-sample');
    const compressButton = getElement(root, 'compress');
    const qualityInput = getElement(root, 'quality-input');
    const qualityValue = getElement(root, 'quality-value');
    const maxWidthInput = getElement(root, 'max-width-input');
    const maxHeightInput = getElement(root, 'max-height-input');
    const status = getElement(root, 'status');
    const cards = getElement(root, 'cards');
    const details = getElement(root, 'details');
    const download = getElement(root, 'download');

    const defaults = getDefaultExampleOptions();
    let currentFile = null;

    qualityInput.value = String(defaults.quality);
    qualityValue.textContent = defaults.quality.toFixed(2);
    maxWidthInput.value = String(defaults.maxWidth);
    maxHeightInput.value = String(defaults.maxHeight);

    qualityInput.addEventListener('input', () => {
      qualityValue.textContent = Number(qualityInput.value).toFixed(2);
    });

    loadSampleButton.addEventListener('click', async () => {
      setStatus(status, 'Loading public sample...');
      try {
        const response = await fetch(samplePdfPath);
        if (!response.ok) {
          throw new Error(`Failed to load sample PDF: ${response.status}`);
        }

        const blob = await response.blob();
        currentFile = new File([blob], 'sample-images.pdf', { type: 'application/pdf' });
        setStatus(status, `Loaded sample-images.pdf (${formatBytes(currentFile.size)})`);
      } catch (error) {
        setStatus(status, error instanceof Error ? error.message : String(error));
      }
    });

    fileInput.addEventListener('change', () => {
      currentFile = fileInput.files?.[0] ?? null;
      clearDownload(download);
      clearResults(cards, details);
      setStatus(
        status,
        currentFile ? `Selected ${currentFile.name} (${formatBytes(currentFile.size)})` : 'Waiting for a PDF file.',
      );
    });

    compressButton.addEventListener('click', async () => {
      if (!currentFile) {
        setStatus(status, 'Select a PDF file or load the public sample first.');
        return;
      }

      clearDownload(download);
      setStatus(status, 'Compressing PDF...');

      try {
        const compressPdf = await loadCompressPdf();
        const result = await compressPdf(currentFile, {
          quality: Number(qualityInput.value),
          maxWidth: clampPositiveInt(maxWidthInput.value, defaults.maxWidth),
          maxHeight: clampPositiveInt(maxHeightInput.value, defaults.maxHeight),
        });
        const viewModel = createResultViewModel({
          fileName: currentFile.name,
          inputBytes: currentFile.size,
          outputBytes: result.data.byteLength,
          summary: result.summary,
        });

        renderCards(cards, viewModel.metricCards);
        renderDetails(details, viewModel.detailItems);
        setStatus(status, viewModel.statusText);
        renderDownload(download, currentFile.name, result.data, viewModel.downloadLabel);
      } catch (error) {
        clearResults(cards, details);
        clearDownload(download);
        setStatus(status, error instanceof Error ? error.message : String(error));
      }
    });
  };
}

function getElement(root, id) {
  const element = root.getElementById(id);
  if (!element) {
    throw new Error(`Missing expected element: #${id}`);
  }

  return element;
}

function setStatus(element, message) {
  element.textContent = message;
}

function renderCards(container, items) {
  container.innerHTML = items
    .map((item) => `<div class="metric-card"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join('');
}

function renderDetails(container, items) {
  container.innerHTML = items
    .map((item) => `<li><span>${item.label}</span><strong>${item.value}</strong></li>`)
    .join('');
}

function renderDownload(element, fileName, bytes, label) {
  clearDownload(element);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  element.href = URL.createObjectURL(blob);
  element.download = fileName.replace(/\.pdf$/i, '.compressed.pdf');
  element.textContent = label;
  element.hidden = false;
}

function clearResults(cards, details) {
  cards.innerHTML = '';
  details.innerHTML = '';
}

function clearDownload(element) {
  if (element.href?.startsWith('blob:')) {
    URL.revokeObjectURL(element.href);
  }

  element.hidden = true;
  element.removeAttribute('href');
  element.textContent = '';
}
