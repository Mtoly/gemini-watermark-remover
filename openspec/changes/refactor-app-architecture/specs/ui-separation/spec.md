# Spec: UI Separation

## Overview
定义 UI 逻辑与业务逻辑分离的规范，确保界面更新与业务处理解耦。

---

## ADDED Requirements

### Requirement: UI Control is Separated from Business Logic
UI control logic MUST be separated from business logic, interacting through explicit interfaces.

#### Scenario: View switching is handled by UI controller
**Given** 用户上传单个或多个图片
**When** 需要切换显示单图预览或批量预览
**Then** 应调用 `showSinglePreview()` 或 `showMultiPreview()`
**And** UI 控制器负责显示/隐藏相关 DOM 元素
**And** 业务逻辑不直接操作 `style.display`

#### Scenario: Status updates are delegated to UI controller
**Given** 图片处理过程中需要更新状态信息
**When** 处理成功、失败或进行中
**Then** 应调用 `updateStatus(id, text, isHtml)` 更新状态
**And** UI 控制器负责查找元素并更新内容
**And** 业务逻辑只传递数据，不操作 DOM

#### Scenario: Progress updates are centralized
**Given** 批量处理图片时需要显示进度
**When** 每完成一张图片
**Then** 应调用 `updateProgress()` 更新进度显示
**And** UI 控制器从状态管理获取 `processedCount` 和 `imageQueue.length`
**And** 自动格式化为 "处理进度: X/Y" 的文本

---

### Requirement: DOM References are Centralized
All DOM element references MUST be centrally managed to avoid repeated queries.

#### Scenario: DOM elements are queried once at initialization
**Given** 应用启动时需要访问多个 DOM 元素
**When** 调用 `getDomRefs()`
**Then** 一次性获取所有需要的 DOM 元素引用
**And** 返回包含所有元素的对象
**And** 后续使用时直接访问对象属性，不再查询 DOM

#### Scenario: DOM references are passed as parameters
**Given** UI 控制器或 handler 需要操作 DOM
**When** 调用相关函数
**Then** 应通过参数传递 `domRefs` 对象
**And** 函数内部通过 `domRefs.elementName` 访问元素
**And** 避免在函数内部调用 `getElementById`

---

### Requirement: Image Rendering is Modular
Image card creation and rendering logic MUST be modularized.

#### Scenario: Image cards are created by renderer
**Given** 批量上传图片需要显示卡片列表
**When** 调用 `createImageCard(item, domRefs)`
**Then** 创建包含图片预览、文件名、状态的卡片 DOM
**And** 将卡片添加到 `domRefs.imageList`
**And** 返回创建的卡片元素或 ID

#### Scenario: Image zoom is managed by renderer
**Given** 图片需要支持点击放大功能
**When** 图片加载完成后
**Then** 应调用 `attachZoom(selector)` 附加缩放功能
**And** 使用 MediumZoom 实例（从状态管理获取）
**And** 在图片更新时先 `detach()` 再重新 `attach()`

---

### Requirement: UI Reset is Centralized
UI reset logic MUST be centrally handled to ensure state consistency.

#### Scenario: Reset clears all UI states
**Given** 用户点击"重���"按钮
**When** 调用 `reset(domRefs)`
**Then** 隐藏单图预览区域（`singlePreview.style.display = 'none'`）
**And** 隐藏批量预览区域（`multiPreview.style.display = 'none'`）
**And** 清空文件输入（`fileInput.value = ''`）
**And** 调用状态管理的重置方法清空队列和计数

---

### Requirement: Dynamic Text Updates Support i18n
Dynamic text updates MUST support internationalization.

#### Scenario: Progress text updates on language switch
**Given** 用户切换语言（中文/英文）
**When** 调用 `updateDynamicTexts()`
**Then** 重新渲染所有动态文本（如进度显示）
**And** 使用 `i18n.t()` 获取当前语言的文本
**And** 保持数据部分不变（如 "3/5"）

---

## MODIFIED Requirements

无（这是新增的 UI 分离规范）

---

## REMOVED Requirements

无（这是新增的 UI 分离规范）

---

## Related Capabilities
- [Modular Architecture](../modular-architecture/spec.md) - 整体模块化架构规范
- [State Management](../state-management/spec.md) - 状态管理规范

---

## Implementation Notes

### DOM References Module
```javascript
// src/ui/domRefs.js
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
```

### UI Controller Module
```javascript
// src/ui/uiController.js
import { getProcessedCount, getImageQueue } from '../state/appState.js';
import i18n from '../i18n.js';

export function showSinglePreview(domRefs) {
  domRefs.singlePreview.style.display = 'block';
  domRefs.multiPreview.style.display = 'none';
}

export function showMultiPreview(domRefs) {
  domRefs.singlePreview.style.display = 'none';
  domRefs.multiPreview.style.display = 'block';
  domRefs.imageList.innerHTML = '';
  domRefs.multiPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function reset(domRefs) {
  domRefs.singlePreview.style.display = 'none';
  domRefs.multiPreview.style.display = 'none';
  domRefs.fileInput.value = '';
  // State reset is handled by state management module
}

export function updateStatus(id, text, isHtml = false) {
  const el = document.getElementById(`status-${id}`);
  if (el) el.innerHTML = isHtml ? text : text.replace(/\n/g, '<br>');
}

export function updateProgress(domRefs) {
  const count = getProcessedCount();
  const total = getImageQueue().length;
  domRefs.progressText.textContent = `${i18n.t('progress.text')}: ${count}/${total}`;
}

export function updateDynamicTexts(domRefs) {
  if (domRefs.progressText.textContent) {
    updateProgress(domRefs);
  }
}
```

### Image Renderer Module
```javascript
// src/ui/imageRenderer.js
import { getZoom } from '../state/appState.js';
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

export function attachZoom(selector) {
  const zoom = getZoom();
  if (zoom) {
    zoom.attach(selector);
  }
}
```

### Usage Example
```javascript
// Good: Separated UI and business logic
import { getDomRefs } from './ui/domRefs.js';
import { showSinglePreview, updateStatus } from './ui/uiController.js';
import { processSingle } from './handlers/processHandler.js';

async function handleSingleUpload(file) {
  const domRefs = getDomRefs();
  showSinglePreview(domRefs);

  const item = { id: Date.now(), file, name: file.name };
  await processSingle(item, domRefs);

  updateStatus(item.id, 'Processing complete', false);
}

// Bad: Mixed UI and business logic
async function handleSingleUpload(file) {
  document.getElementById('singlePreview').style.display = 'block';
  document.getElementById('multiPreview').style.display = 'none';

  const item = { id: Date.now(), file, name: file.name };
  const img = await loadImage(file);
  const result = await engine.removeWatermarkFromImage(img);

  document.getElementById(`status-${item.id}`).textContent = 'Processing complete';
}
```

### UI Update Flow
```
Business Logic (Handler)
  ├─> Calls UI Controller method
  │     └─> UI Controller updates DOM
  │
  └─> Passes data, not DOM operations

Example:
processHandler.processSingle()
  ├─> uiController.showSinglePreview(domRefs)
  ├─> Process image...
  └─> uiController.updateStatus(id, 'Complete')
```
