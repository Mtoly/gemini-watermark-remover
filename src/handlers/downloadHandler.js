import JSZip from 'jszip';
import * as appState from '../state/appState.js';

export function downloadImage(item) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(item.processedBlob);
  a.download = `unwatermarked_${item.name.replace(/\.[^.]+$/, '')}.png`;
  a.click();
}

export async function downloadAll() {
  const imageQueue = appState.getImageQueue();
  const completed = imageQueue.filter(item => item.status === 'completed');
  if (completed.length === 0) return;

  const zip = new JSZip();
  completed.forEach(item => {
    const filename = `unwatermarked_${item.name.replace(/\.[^.]+$/, '')}.png`;
    zip.file(filename, item.processedBlob);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `unwatermarked_${Date.now()}.zip`;
  a.click();
}
