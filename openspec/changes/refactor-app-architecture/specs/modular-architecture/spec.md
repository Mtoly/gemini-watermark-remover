# Spec: Modular Architecture

## Overview
定义项目的模块化架构规范，确保代码按职责清晰分离，提升可维护性和可读性。

---

## ADDED Requirements

### Requirement: Module Organization by Responsibility
Modules SHALL be organized by responsibility, with each module responsible for a single, well-defined functional area.

#### Scenario: State management is centralized
**Given** 应用需要管理全局状态（如 engine, imageQueue, processedCount, zoom）
**When** 开发者需要访问或修改全局状态
**Then** 所有状态管理逻辑应集中在 `src/state/` 目录下
**And** 状态访问通过明确的 getter/setter 方法
**And** 不允许直接访问全局变量

#### Scenario: UI control is separated from business logic
**Given** 应用需要更新 UI 元素（显示/隐藏、内容更新）
**When** 业务逻辑需要触发 UI 变化
**Then** UI 控制逻辑应���中在 `src/ui/` 目录下
**And** UI 控制器不包含业务逻辑
**And** 业务逻辑通过调用 UI 控制器方法来更新界面

#### Scenario: Event handlers are grouped by domain
**Given** 应用需要处理用户交互（文件上传、下载、处理）
**When** 用户触发某个操作
**Then** 相关的事件处理逻辑应集中在 `src/handlers/` 目录下
**And** 每个 handler 文件负责一个功能域（file, process, download）
**And** Handler 协调状态管理和 UI 更新

---

### Requirement: Single Responsibility Principle
Each module file MUST follow the Single Responsibility Principle, being responsible for only one clear function.

#### Scenario: DOM references are centralized
**Given** 应用需要访问多个 DOM 元素
**When** 模块需要操作 DOM
**Then** 所有 DOM 元素引用应集中在 `src/ui/domRefs.js`
**And** 通过 `getDomRefs()` 函数统一获取
**And** 避免在多处重复 `getElementById` 调用

#### Scenario: File validation is isolated
**Given** 用户上传文件
**When** 需要验证文件类型和大小
**Then** 验证逻辑应在 `src/handlers/fileHandler.js` 中
**And** 验证规则集中定义（类型: jpeg/png/webp, 大小: <20MB）
**And** 验证结果明确返回（通过/失败）

#### Scenario: Download logic is self-contained
**Given** 用户需要下载处理后的图片
**When** 触发下载操作（单个或批量）
**Then** 所有下载逻辑应在 `src/handlers/downloadHandler.js` 中
**And** 包括单个下载、ZIP 打包、文件命名规则
**And** 不与其他业务逻辑混合

---

### Requirement: Module Size Constraints
Module files SHALL maintain reasonable size to avoid excessive responsibility in a single file.

#### Scenario: No single module exceeds 150 lines
**Given** 开发者创建或修改模块文件
**When** 文件代码行数增长
**Then** 单个模块文件不应超过 150 行（不含空行和注释）
**And** 如果超过，应考虑进一步拆分职责
**And** 主入口 `app.js` 应控制在 100 行以内

#### Scenario: Main entry point is minimal
**Given** 应用启动时需要初始化
**When** 执行 `app.js` 的 `init()` 函数
**Then** 主入口只负责协调各模块的初始化
**And** 不包含具体的业务逻辑实现
**And** 代码行数应在 80-100 行之间

---

### Requirement: Clear Module Dependencies
Module dependencies MUST be clear and explicit, avoiding circular dependencies.

#### Scenario: State module has no business logic dependencies
**Given** 状态管理模块 `src/state/appState.js`
**When** 其他模块需要访问状态
**Then** 状态模块只依赖基础类型和外部库（如 WatermarkEngine）
**And** 不依赖任何业务逻辑模块（handlers, ui）
**And** 作为底层模块被其他模块依赖

#### Scenario: Handlers depend on state and UI
**Given** 业务逻辑处理器（fileHandler, processHandler, downloadHandler）
**When** 处理用户操作
**Then** Handlers 可以依赖 `state/appState.js` 访问状态
**And** 可以依赖 `ui/` 模块更新界面
**And** 可以依赖 `utils.js` 使用工具函数
**And** Handlers 之间应避免相互依赖

#### Scenario: UI modules depend only on state
**Given** UI 控制模块（uiController, imageRenderer）
**When** 需要更新界面
**Then** UI 模块可以依赖 `state/appState.js` 读取状态
**And** 不应依赖业务逻辑模块（handlers）
**And** 保持 UI 逻辑的纯粹性

---

## MODIFIED Requirements

无（这是新增的架构规范）

---

## REMOVED Requirements

无（这是新增的架构规范）

---

## Related Capabilities
- [State Management](../state-management/spec.md) - 状态管理的具体实现规范
- [UI Separation](../ui-separation/spec.md) - UI 分离的具体实现规范

---

## Implementation Notes

### Directory Structure
```
src/
├── app.js                    # Main entry (80-100 lines)
├── state/
│   └── appState.js          # State management (40 lines)
├── ui/
│   ├── domRefs.js           # DOM references (20 lines)
│   ├── uiController.js      # UI control (50 lines)
│   └── imageRenderer.js     # Image rendering (30 lines)
├── handlers/
│   ├── fileHandler.js       # File handling (50 lines)
│   ├── processHandler.js    # Image processing (120 lines)
│   └── downloadHandler.js   # Download logic (30 lines)
└── config/
    └── tailwind.config.js   # Tailwind config (20 lines)
```

### Module Import Pattern
```javascript
// Good: Clear dependency hierarchy
import { getEngine, setEngine } from './state/appState.js';
import { getDomRefs } from './ui/domRefs.js';
import { showSinglePreview } from './ui/uiController.js';

// Bad: Circular dependency
// fileHandler.js imports processHandler.js
// processHandler.js imports fileHandler.js
```

### Code Organization Checklist
- [ ] 每个模块职责单一明确
- [ ] 模块文件大小合理（<150行）
- [ ] 依赖关系清晰无循环
- [ ] 导入导出接口明确
- [ ] 模块间通过参数传递依赖，而非全局变量
