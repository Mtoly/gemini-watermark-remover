# Spec: State Management

## Overview
定义应用全局状态的管理规范，确保状态访问的一致性和可控性。

---

## ADDED Requirements

### Requirement: Centralized State Storage
All application-level state MUST be centrally stored and managed.

#### Scenario: WatermarkEngine instance is managed centrally
**Given** 应用需要使用 WatermarkEngine 进行图片处理
**When** 任何模块需要访问 engine 实例
**Then** 应通过 `getEngine()` 获取实例
**And** 应通过 `setEngine(engine)` 设置实例
**And** 不允许直接访问全局变量

#### Scenario: Image queue is managed centrally
**Given** 用户上传单个或多个图片
**When** 需要存储待处理的图片队列
**Then** 应通过 `getImageQueue()` 获取队列
**And** 应通过 `setImageQueue(queue)` 设置队列
**And** 队列结构为 `Array<{ id, file, name, status, originalImg, processedBlob }>`

#### Scenario: Processed count is tracked centrally
**Given** 批量处理图片时需要显示进度
**When** 每完成一张图片的处理
**Then** 应通过 `incrementProcessedCount()` 增加计数
**And** 应通过 `getProcessedCount()` 获取当前计数
**And** 应通过 `setProcessedCount(count)` 重置计数

#### Scenario: MediumZoom instance is managed centrally
**Given** 应用使用 MediumZoom 提供图片缩放功能
**When** 需要附加或分离缩放功能
**Then** 应通过 `getZoom()` 获取 zoom 实例
**And** 应通过 `setZoom(zoom)` 设置实例
**And** 在图片更新后调用 `zoom.detach()` 和 `zoom.attach()`

---

### Requirement: State Access Interface
State access MUST be through explicit interface methods, direct access to internal variables is not allowed.

#### Scenario: State getters provide read access
**Given** 模块需要读取状态
**When** 调用 getter 方法（如 `getEngine()`）
**Then** 返回当前状态值
**And** 不暴露内部变量引用
**And** 保证状态读取的一致性

#### Scenario: State setters provide write access
**Given** 模块需要修改状态
**When** 调用 setter 方法（如 `setEngine(engine)`）
**Then** 更新内部状态值
**And** 可以在 setter 中添加验证逻辑
**And** 保证状态修改的可控性

#### Scenario: State helpers provide convenient operations
**Given** 需要对状态进行常见操作
**When** 调用辅助方法（如 `incrementProcessedCount()`）
**Then** 执行预定义的状态操作
**And** 避免重复的读取-修改-写入代码
**And** 提供更语义化的接口

---

### Requirement: State Initialization
State MUST be correctly initialized when the application starts.

#### Scenario: State starts with null values
**Given** 应用刚启动
**When** 状态模块被导入
**Then** 所有状态初始值应为 `null` 或空值
**And** `engine = null`
**And** `imageQueue = []`
**And** `processedCount = 0`
**And** `zoom = null`

#### Scenario: State is initialized during app init
**Given** 应用执行 `init()` 函数
**When** 创建 WatermarkEngine 和 MediumZoom 实例
**Then** 应调用 `setEngine(engine)` 设置 engine
**And** 应调用 `setZoom(zoom)` 设置 zoom
**And** 确保状态在使用前已正确初始化

---

### Requirement: State Reset
State MUST support reset operations for users to restart processing.

#### Scenario: Image queue is cleared on reset
**Given** 用户点击"重置"按钮
**When** 执行重置操作
**Then** 应调用 `setImageQueue([])` 清空队列
**And** 应调用 `setProcessedCount(0)` 重置计数
**And** UI 状态应同步更新

#### Scenario: Engine and zoom persist across resets
**Given** 用户点击"重置"按钮
**When** 执行重置操作
**Then** `engine` 实例不应被清空（复用）
**And** `zoom` 实例不应被清空（复用）
**And** 仅清空与当前处理任务相关的状态

---

## MODIFIED Requirements

无（这是新增的状态管理规范）

---

## REMOVED Requirements

无（这是新增的状态管理规范）

---

## Related Capabilities
- [Modular Architecture](../modular-architecture/spec.md) - 整体模块化架构规范

---

## Implementation Notes

### State Module Interface
```javascript
// src/state/appState.js

// Internal state (not exported)
let engine = null;
let imageQueue = [];
let processedCount = 0;
let zoom = null;

// Getters
export function getEngine() { return engine; }
export function getImageQueue() { return imageQueue; }
export function getProcessedCount() { return processedCount; }
export function getZoom() { return zoom; }

// Setters
export function setEngine(value) { engine = value; }
export function setImageQueue(value) { imageQueue = value; }
export function setProcessedCount(value) { processedCount = value; }
export function setZoom(value) { zoom = value; }

// Helpers
export function incrementProcessedCount() { processedCount++; }
```

### Usage Example
```javascript
// Good: Use state management interface
import { getEngine, setEngine } from './state/appState.js';

async function init() {
  const engine = await WatermarkEngine.create();
  setEngine(engine);
}

async function processImage(img) {
  const engine = getEngine();
  return await engine.removeWatermarkFromImage(img);
}

// Bad: Direct global variable access
let engine = null; // Global variable

async function init() {
  engine = await WatermarkEngine.create(); // Direct assignment
}

async function processImage(img) {
  return await engine.removeWatermarkFromImage(img); // Direct access
}
```

### State Lifecycle
```
Application Start
  ├─> State module loaded (all values = null/empty)
  ├─> app.js:init() called
  │     ├─> WatermarkEngine.create() -> setEngine()
  │     └─> mediumZoom() -> setZoom()
  │
User uploads files
  ├─> fileHandler creates queue -> setImageQueue()
  └─> processHandler processes images
        └─> incrementProcessedCount() for each

User clicks reset
  ├─> setImageQueue([])
  └─> setProcessedCount(0)
```

### State Validation
```javascript
// Optional: Add validation in setters
export function setEngine(value) {
  if (value && typeof value.removeWatermarkFromImage !== 'function') {
    throw new Error('Invalid engine instance');
  }
  engine = value;
}

export function setImageQueue(value) {
  if (!Array.isArray(value)) {
    throw new Error('Image queue must be an array');
  }
  imageQueue = value;
}
```
