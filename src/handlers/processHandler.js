import i18n from '../i18n.js';
import * as appState from '../state/appState.js';
import { loadImage, checkOriginal, getOriginalStatus, setStatusMessage } from '../utils.js';
import { updateStatus } from '../ui/imageRenderer.js';
import { updateProgress } from '../ui/uiController.js';
import { downloadImage } from './downloadHandler.js';

export async function processSingle(item, domRefs) {
  try {
    const img = await loadImage(item.file);
    item.originalImg = img;

    const { is_google, is_original } = await checkOriginal(item.file);
    const status = getOriginalStatus({ is_google, is_original });
    setStatusMessage(status, is_google && is_original ? 'success' : 'warn');

    domRefs.originalImage.src = img.src;

    const engine = appState.getEngine();
    const watermarkInfo = engine.getWatermarkInfo(img.width, img.height);
    domRefs.originalInfo.innerHTML = `
      <p>${i18n.t('info.size')}: ${img.width}×${img.height}</p>
      <p>${i18n.t('info.watermark')}: ${watermarkInfo.size}×${watermarkInfo.size}</p>
      <p>${i18n.t('info.position')}: (${watermarkInfo.position.x},${watermarkInfo.position.y})</p>
    `;

    const result = await engine.removeWatermarkFromImage(img);
    const blob = await new Promise(resolve => result.toBlob(resolve, 'image/png'));
    item.processedBlob = blob;

    domRefs.processedImage.src = URL.createObjectURL(blob);
    domRefs.processedSection.style.display = 'block';
    domRefs.downloadBtn.style.display = 'flex';
    domRefs.downloadBtn.onclick = () => downloadImage(item);

    domRefs.processedInfo.innerHTML = `
      <p>${i18n.t('info.size')}: ${img.width}×${img.height}</p>
      <p>${i18n.t('info.status')}: ${i18n.t('info.removed')}</p>
    `;

    const zoom = appState.getZoom();
    zoom.detach();
    zoom.attach('[data-zoomable]');

    domRefs.processedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    console.error(error);
  }
}

export async function processQueue(domRefs) {
  const imageQueue = appState.getImageQueue();
  const zoom = appState.getZoom();

  for (const item of imageQueue) {
    const img = await loadImage(item.file);
    item.originalImg = img;
    document.getElementById(`result-${item.id}`).src = img.src;
    zoom.attach(`#result-${item.id}`);
  }

  const engine = appState.getEngine();
  for (const item of imageQueue) {
    if (item.status !== 'pending') continue;

    item.status = 'processing';
    updateStatus(item.id, i18n.t('status.processing'));

    try {
      const result = await engine.removeWatermarkFromImage(item.originalImg);
      const blob = await new Promise(resolve => result.toBlob(resolve, 'image/png'));
      item.processedBlob = blob;

      document.getElementById(`result-${item.id}`).src = URL.createObjectURL(blob);

      item.status = 'completed';
      const watermarkInfo = engine.getWatermarkInfo(item.originalImg.width, item.originalImg.height);
      const { is_google, is_original } = await checkOriginal(item.originalImg);
      const originalStatus = getOriginalStatus({ is_google, is_original });

      updateStatus(item.id, `<p>${i18n.t('info.size')}: ${item.originalImg.width}×${item.originalImg.height}</p>
      <p>${i18n.t('info.watermark')}: ${watermarkInfo.size}×${watermarkInfo.size}</p>
      <p>${i18n.t('info.position')}: (${watermarkInfo.position.x},${watermarkInfo.position.y})</p>
      <p class="inline-block mt-1 text-xs md:text-sm ${is_google && is_original ? 'hidden' : 'text-warn'}">${originalStatus}</p>`, true);

      const downloadBtn = document.getElementById(`download-${item.id}`);
      downloadBtn.classList.remove('hidden');
      downloadBtn.onclick = () => downloadImage(item);

      appState.incrementProcessedCount();
      updateProgress(domRefs);
    } catch (error) {
      item.status = 'error';
      updateStatus(item.id, i18n.t('status.failed'));
      console.error(error);
    }
  }

  if (appState.getProcessedCount() > 0) {
    domRefs.downloadAllBtn.style.display = 'flex';
  }
}
