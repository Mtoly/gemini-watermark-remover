# Design: Refactor App Architecture

## Architecture Overview

### Current Architecture (Before)
```
public/
└── index.html (280 lines)
    ├── Inline Tailwind Config
    ├── Inline Custom Styles
    └── HTML Structure

src/
├── app.js (293 lines)
│   ├── Global State (engine, imageQueue, processedCount, zoom)
│   ├── DOM References (14 elements)
│   ├── Initialization Logic
│   ├── Event Handlers Setup
│   ├── File Handling
│   ├── Image Processing (Single & Batch)
│   ├── UI Updates
│   ├── Download Logic
│   └── Language Switching
├── core/
│   ├── watermarkEngine.js
│   ├── alphaMap.js
│   └── blendModes.js
├── i18n.js
└── utils.js
```

### Target Architecture (After)
```
public/
├── index.html (215 lines) - Simplified, no inline config/styles
└── styles.css (45 lines) - Extracted custom styles

src/
├── app.js (80-100 lines) - Entry point & coordinator only
│   ├── Import all modules
│   ├── Initialize application
│   └── Setup event listeners (delegate to handlers)
│
├── state/
│   └── appState.js (40 lines)
│       ├── engine: WatermarkEngine instance
│       ├── imageQueue: Array of image items
│       ├── processedCount: Number
│       ├── zoom: MediumZoom instance
│       └── Getters/Setters for state management
│
├── ui/
│   ├── domRefs.js (20 lines)
│   │   └── getDomRefs(): Object with all DOM element references
│   │
│   ├── uiController.js (50 lines)
│   │   ├── showSinglePreview()
│   │   ├── showMultiPreview()
│   │   ├── reset()
│   │   ├── updateStatus()
│   │   ├── updateProgress()
│   │   └── updateDynamicTexts()
│   │
│   └── imageRenderer.js (30 lines)
│       ├── createImageCard()
│       ├── updateImageCard()
│       └── attachZoom()
│
├── handlers/
│   ├── fileHandler.js (50 lines)
│   │   ├── handleFileSelect()
│   │   ├── handleFiles()
│   │   ├── validateFile()
│   │   └── setupUploadListeners()
│   │
│   ├── processHandler.js (120 lines)
│   │   ├── processSingle()
│   │   ├── processQueue()
│   │   ├── processImage()
│   │   └── handleProcessError()
│   │
│   └── downloadHandler.js (30 lines)
│       ├── downloadImage()
│       ├── downloadAll()
│       └── setupDownloadListeners()
│
├── config/
│   └── tailwind.config.js (20 lines)
│       └── Tailwind theme configuration
│
├── core/ (unchanged)
├── i18n.js (unchanged)
└── utils.js (unchanged)
```

## Module Responsibilities

### 1. app.js (Main Entry)
**职责**: 应用初始化和模块协调
- 导入所有必要模块
- 初始化 WatermarkEngine
- 初始化 i18n
- 初始化 MediumZoom
- 协调各模块的初始化顺序
- 不包含具体业务逻辑

**接口**:
```javascript
async function init()
function setupLanguageSwitch()
```

### 2. state/appState.js (State Management)
**职责**: 全局状态管理
- 管理应用级别的状态变量
- 提供状态的读写接口
- 确保状态访问的一致性

**接口**:
```javascript
export function getEngine()
export function setEngine(engine)
export function getImageQueue()
export function setImageQueue(queue)
export function getProcessedCount()
export function setProcessedCount(count)
export function incrementProcessedCount()
export function getZoom()
export function setZoom(zoom)
```

### 3. ui/domRefs.js (DOM References)
**职责**: 集中管理 DOM 元素引用
- 一次性获取所有需要的 DOM 元素
- 提供类型安全的元素访问
- 避免重复的 `getElementById` 调用

**接口**:
```javascript
export function getDomRefs() {
  return {
    uploadArea,
    fileInput,
    singlePreview,
    multiPreview,
    imageList,
    progressText,
    downloadAllBtn,
    originalImage,
    processedSection,
    processedImage,
    originalInfo,
    processedInfo,
    downloadBtn,
    resetBtn,
    langSwitch
  }
}
```

### 4. ui/uiController.js (UI Control)
**职责**: UI 状态控制和更新
- 控制视图的显示/隐藏
- 更新 UI 元素的内容
- 处理 UI 状态切换
- 不包含业务逻辑

**接口**:
```javascript
export function showSinglePreview()
export function showMultiPreview()
export function reset(domRefs)
export function updateStatus(id, text, isHtml)
export function updateProgress()
export function updateDynamicTexts()
```

### 5. ui/imageRenderer.js (Image Rendering)
**职责**: 图片卡片的创建和渲染
- 创建批量处理的图片卡片
- 更新图片卡片状态
- 管理图片缩放功能

**接口**:
```javascript
export function createImageCard(item, domRefs)
export function updateImageCard(item, domRefs)
export function attachZoom(selector)
```

### 6. handlers/fileHandler.js (File Handling)
**职责**: 文件上传和验证
- 处理文件选择事件
- 处理拖拽上传
- 验证文件类型和大小
- 创建图片队列

**接口**:
```javascript
export function setupUploadListeners(domRefs, onFilesReady)
export function handleFileSelect(event)
export function handleFiles(files)
export function validateFile(file)
```

### 7. handlers/processHandler.js (Image Processing)
**职责**: 图片处理业务逻辑
- 单图处理流程
- 批量处理流程
- 调用 WatermarkEngine 进行处理
- 处理 EXIF 检查
- 错误处理

**接口**:
```javascript
export async function processSingle(item, domRefs)
export async function processQueue(domRefs)
export async function processImage(img)
export function handleProcessError(error, item)
```

### 8. handlers/downloadHandler.js (Download Handling)
**职责**: 下载功能
- 单个图片下载
- 批量打包下载
- 设置下载按钮事件

**接口**:
```javascript
export function setupDownloadListeners(domRefs)
export function downloadImage(item)
export async function downloadAll()
```

### 9. config/tailwind.config.js (Configuration)
**职责**: Tailwind CSS 配置
- 定义主题颜色
- 定义自定义样式
- 从 HTML 中分离配置

**接口**:
```javascript
export default {
  theme: {
    extend: { ... }
  }
}
```

## Data Flow

### 1. Application Initialization
```
app.js:init()
  ├─> i18n.init()
  ├─> WatermarkEngine.create() -> appState.setEngine()
  ├─> mediumZoom() -> appState.setZoom()
  ├─> domRefs.getDomRefs()
  ├─> fileHandler.setupUploadListeners()
  ├─> downloadHandler.setupDownloadListeners()
  └─> setupLanguageSwitch()
```

### 2. Single Image Upload Flow
```
User uploads file
  ├─> fileHandler.handleFiles()
  │     ├─> validateFile()
  │     └─> appState.setImageQueue([item])
  │
  ├─> uiController.showSinglePreview()
  │
  └─> processHandler.processSingle(item)
        ├─> utils.loadImage()
        ├─> utils.checkOriginal()
        ├─> appState.getEngine().removeWatermarkFromImage()
        ├─> uiController.updateStatus()
        └─> imageRenderer.attachZoom()
```

### 3. Batch Upload Flow
```
User uploads multiple files
  ├─> fileHandler.handleFiles()
  │     ├─> validateFile() for each
  │     └─> appState.setImageQueue(items)
  │
  ├─> uiController.showMultiPreview()
  │
  ├─> imageRenderer.createImageCard() for each
  │
  └─> processHandler.processQueue()
        ├─> Load all images first
        ├─> Process each sequentially
        │     ├─> appState.getEngine().removeWatermarkFromImage()
        │     ├─> uiController.updateStatus()
        │     └─> appState.incrementProcessedCount()
        └─> uiController.updateProgress()
```

### 4. Download Flow
```
User clicks download
  ├─> downloadHandler.downloadImage(item)
  │     └─> Create blob URL and trigger download
  │
  OR
  │
  └─> downloadHandler.downloadAll()
        ├─> JSZip.create()
        ├─> Add all processed images
        └─> Trigger zip download
```

## Dependency Graph

```
app.js
  ├─> state/appState.js
  ├─> ui/domRefs.js
  ├─> ui/uiController.js
  │     └─> state/appState.js
  ├─> ui/imageRenderer.js
  │     └─> state/appState.js
  ├─> handlers/fileHandler.js
  │     ├─> state/appState.js
  │     └─> ui/uiController.js
  ├─> handlers/processHandler.js
  │     ├─> state/appState.js
  │     ├─> ui/uiController.js
  │     ├─> ui/imageRenderer.js
  │     └─> utils.js
  ├─> handlers/downloadHandler.js
  │     └─> state/appState.js
  ├─> core/watermarkEngine.js
  ├─> i18n.js
  └─> utils.js

index.html
  ├─> styles.css (new)
  └─> config/tailwind.config.js (new)
```

## Migration Strategy

### Phase-by-Phase Approach

**Phase 1: Foundation**
- 创建目录结构
- 提取 DOM 引用（最简单，无业务逻辑）
- 验证：构建成功，运行正常

**Phase 2: State Management**
- 提取状态管理（独立模块，依赖少）
- 验证：状态读写正常

**Phase 3: Business Logic**
- 提取文件处理（依赖状态管理）
- 提取图片处理（核心逻辑，依赖多）
- 提取下载逻辑（相对独立）
- 验证：每个功能独立测试

**Phase 4: UI Control**
- 提取 UI 控制器（依赖状态和DOM引用）
- 提取图片渲染（依赖DOM引用）
- 验证：UI更新正常

**Phase 5: Configuration**
- 提取 Tailwind 配置（独立于JS）
- 提取自定义样式（独立于JS）
- 验证：样式显示正常

**Phase 6: Main Entry**
- 简化 app.js（整合所有模块）
- 验证：完整功能测试

**Phase 7: Validation**
- 完整功能测试
- 构建流程验证
- 代码质量检查

## Error Handling Strategy

### 保持现有错误处理
- 不改变现有的 try-catch 结构
- 错误处理逻辑随函数迁移
- 保持 console.error 的位置和内容

### 模块间错误传播
- 使用 async/await 传播异步错误
- 在调用链顶层捕获错误
- 不在中间层吞掉错误

## Testing Strategy

### 手动测试清单
每个 Phase 完成后执行：
1. ✅ 单图上传和处理
2. ✅ 批量上传和处理
3. ✅ 单个下载
4. ✅ 批量下载（ZIP）
5. ✅ 拖拽上传
6. ✅ 语言切换
7. ✅ 图片缩放预览
8. ✅ 重置功能
9. ✅ EXIF 检查提示
10. ✅ 错误处理（无效文件、处理失败等）

### 构建测试
- `pnpm dev` - 开发模式正常
- `pnpm build` - 生产构建成功
- 检查 dist/ 产物结构
- 检查文件大小变化（应该相近）

## Performance Considerations

### 不影响性能
- 模块拆分不增加运行时开销（esbuild 会打包）
- 函数调用层级不增加（仅重新组织）
- 不引入新的依赖库
- 不改变算法逻辑

### 可能的优化机会
- DOM 引用集中获取，避免重复查询
- 状态管理集中，便于后续优化
- 模块化后便于按需加载（未来可选）

## Rollback Plan

### Git Commit Strategy
每个 Phase 完成后创建独立 commit：
- 便于代码审查
- 便于问题定位
- 便于回滚到稳定状态

### 回滚步骤
如果某个 Phase 出现问题：
1. `git log --oneline` 查看提交历史
2. `git revert <commit-hash>` 回滚问题提交
3. 或 `git reset --hard <previous-commit>` 硬回滚

## Future Enhancements

重构完成后，架构将支持以下扩展：
- 单元测试：每个模块可独立测试
- 状态持久化：在 appState 中添加 localStorage 支持
- 插件系统：通过依赖注入扩展功能
- TypeScript 迁移：模块边界清晰，便于添加类型
- 性能监控：在关键模块添加性能埋点

## Constraints and Limitations

### 必须遵守的约束
1. **功能不变**：所有现有功能必须保持完全一致
2. **无新依赖**：不引入新的 npm 包
3. **构建兼容**：esbuild 配置保持兼容
4. **代码风格**：遵循项目现有代码风格
5. **注释风格**：简洁专业，不解释动机

### 不在本次重构范围
1. 不添加 TypeScript
2. 不添加测试框架
3. 不改变算法逻辑
4. 不优化性能（除非重构自然带来）
5. 不添加新功能
6. 不修改 userscript 部分

## Success Metrics

### 定量指标
- ✅ app.js 从 293 行减少到 80-100 行
- ✅ index.html 从 280 行减少到 215 行
- ✅ 新增 8 个模块文件，总代码量不变
- ✅ 最大单文件不超过 150 行
- ✅ 构建产物大小变化 < 5%

### 定性指标
- ✅ 每个模块职责单一清晰
- ✅ 模块间依赖关系明确
- ✅ 代码可读性显著提升
- ✅ 新功能开发更容易定位代码位置
- ✅ 维护成本降低
