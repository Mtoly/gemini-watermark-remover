export function getDomRefs() {
  return {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    singlePreview: document.getElementById('singlePreview'),
    multiPreview: document.getElementById('multiPreview'),
    imageList: document.getElementById('imageList'),
    progressText: document.getElementById('progressText'),
    downloadAllBtn: document.getElementById('downloadAllBtn'),
    originalImage: document.getElementById('originalImage'),
    processedSection: document.getElementById('processedSection'),
    processedImage: document.getElementById('processedImage'),
    originalInfo: document.getElementById('originalInfo'),
    processedInfo: document.getElementById('processedInfo'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    langSwitch: document.getElementById('langSwitch')
  };
}
