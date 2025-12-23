let engine = null;
let imageQueue = [];
let processedCount = 0;
let zoom = null;

export function getEngine() {
  return engine;
}

export function setEngine(value) {
  engine = value;
}

export function getImageQueue() {
  return imageQueue;
}

export function setImageQueue(queue) {
  imageQueue = queue;
}

export function getProcessedCount() {
  return processedCount;
}

export function setProcessedCount(count) {
  processedCount = count;
}

export function incrementProcessedCount() {
  processedCount++;
  return processedCount;
}

export function getZoom() {
  return zoom;
}

export function setZoom(value) {
  zoom = value;
}
