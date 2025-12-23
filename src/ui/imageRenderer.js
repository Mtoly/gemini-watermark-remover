import i18n from '../i18n.js';

export function createImageCard(item, domRefs) {
  const card = document.createElement('div');
  card.id = `card-${item.id}`;
  card.className = 'bg-white md:h-[140px] rounded-xl shadow-card border border-gray-100 overflow-hidden';
  card.innerHTML = `
    <div class="flex flex-wrap h-full">
      <div class="w-full md:w-auto h-full flex border-b border-gray-100">
        <div class="w-24 md:w-48 flex-shrink-0 bg-gray-50 p-2 flex items-center justify-center">
          <img id="result-${item.id}" class="max-w-full max-h-24 md:max-h-full rounded" data-zoomable />
        </div>
        <div class="flex-1 p-4 flex flex-col min-w-0">
          <h4 class="font-semibold text-sm text-gray-900 mb-2 truncate">${item.name}</h4>
          <div class="text-xs text-gray-500" id="status-${item.id}">${i18n.t('status.pending')}</div>
        </div>
      </div>
      <div class="w-full md:w-auto ml-auto flex-shrink-0 p-2 md:p-4 flex items-center justify-center">
        <button id="download-${item.id}" class="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs md:text-sm hidden">${i18n.t('btn.download')}</button>
      </div>
    </div>
  `;
  domRefs.imageList.appendChild(card);
}

export function updateStatus(id, text, isHtml = false) {
  const el = document.getElementById(`status-${id}`);
  if (el) el.innerHTML = isHtml ? text : text.replace(/\n/g, '<br>');
}
