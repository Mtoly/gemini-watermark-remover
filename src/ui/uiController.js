import i18n from '../i18n.js';
import * as appState from '../state/appState.js';

export function reset(domRefs) {
  domRefs.singlePreview.style.display = 'none';
  domRefs.multiPreview.style.display = 'none';
  appState.setImageQueue([]);
  appState.setProcessedCount(0);
  domRefs.fileInput.value = '';
}

export function updateProgress(domRefs) {
  const imageQueue = appState.getImageQueue();
  const processedCount = appState.getProcessedCount();
  domRefs.progressText.textContent = `${i18n.t('progress.text')}: ${processedCount}/${imageQueue.length}`;
}

export function updateDynamicTexts(domRefs) {
  if (domRefs.progressText.textContent) {
    updateProgress(domRefs);
  }
}
