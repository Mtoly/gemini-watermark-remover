import * as appState from '../state/appState.js';
import { updateProgress } from '../ui/uiController.js';
import { createImageCard } from '../ui/imageRenderer.js';

export function handleFileSelect(e, domRefs, processSingle, processQueue) {
  handleFiles(Array.from(e.target.files), domRefs, processSingle, processQueue);
}

export function handleFiles(files, domRefs, processSingle, processQueue) {
  const validFiles = files.filter(file => {
    if (!file.type.match('image/(jpeg|png|webp)')) return false;
    if (file.size > 20 * 1024 * 1024) return false;
    return true;
  });

  if (validFiles.length === 0) return;

  const imageQueue = validFiles.map((file, index) => ({
    id: Date.now() + index,
    file,
    name: file.name,
    status: 'pending',
    originalImg: null,
    processedBlob: null
  }));
  appState.setImageQueue(imageQueue);

  appState.setProcessedCount(0);

  if (validFiles.length === 1) {
    domRefs.singlePreview.style.display = 'block';
    domRefs.multiPreview.style.display = 'none';
    processSingle(imageQueue[0]);
  } else {
    domRefs.singlePreview.style.display = 'none';
    domRefs.multiPreview.style.display = 'block';
    domRefs.imageList.innerHTML = '';
    updateProgress(domRefs);
    domRefs.multiPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    imageQueue.forEach(item => createImageCard(item, domRefs));
    processQueue();
  }
}
