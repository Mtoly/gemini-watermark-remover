# Tasks: Refactor App Architecture

## Overview
将重构工作分解为可独立验证的小步骤，每个步骤完成后都能保持系统正常运行。

## Task List

### Phase 1: 准备和基础设施 (Foundation)

- [x] **Task 1.1**: 创建新的目录结构
  - 创建 `src/state/`, `src/ui/`, `src/handlers/`, `src/config/` 目录
  - **验证**: 目录结构创建成功
  - **依赖**: 无
  - **预计影响**: 无，仅创建空目录

- [x] **Task 1.2**: 提取 DOM 引用模块
  - 创建 `src/ui/domRefs.js`，集中管理所有 DOM 元素引用
  - 从 `app.js` 中提取 14-27 行的 DOM 引用代码
  - 导出一个 `getDomRefs()` 函数返回所有引用
  - **验证**: 构建成功，无运行时错误
  - **依赖**: Task 1.1
  - **预计影响**: app.js 减少约15行

### Phase 2: 状态管理拆分 (State Management)

- [x] **Task 2.1**: 创建全局状态管理模块
  - 创建 `src/state/appState.js`
  - 提取全局变量：`engine`, `imageQueue`, `processedCount`, `zoom`
  - 提供 getter/setter 方法管理状态
  - **验证**: 状态读写正常，功能不受影响
  - **依赖**: Task 1.1
  - **预计影响**: app.js 减少约10行

### Phase 3: 业务逻辑拆分 (Business Logic)

- [x] **Task 3.1**: 提取文件处理逻辑
  - 创建 `src/handlers/fileHandler.js`
  - 迁移 `handleFileSelect`, `handleFiles` 函数
  - 迁移文件验证逻辑（107-111行）
  - **验证**: 文件上传、拖拽功能正常
  - **依赖**: Task 1.2, Task 2.1
  - **预计影响**: app.js 减少约40行

- [x] **Task 3.2**: 提取图片处理逻辑
  - 创建 `src/handlers/processHandler.js`
  - 迁移 `processSingle`, `processQueue` 函数
  - 迁移图片处理相关逻辑（141-252行）
  - **验证**: 单图和批量处理功能正常
  - **依赖**: Task 2.1, Task 3.1
  - **预计影响**: app.js 减少约110行

- [x] **Task 3.3**: 提取下载逻辑
  - 创建 `src/handlers/downloadHandler.js`
  - 迁移 `downloadImage`, `downloadAll` 函数（269-291行）
  - **验证**: 单个下载和批量下载功能正常
  - **依赖**: Task 2.1
  - **预计影响**: app.js 减少约25行

### Phase 4: UI控制拆分 (UI Control)

- [x] **Task 4.1**: 提取UI控制器
  - 创建 `src/ui/uiController.js`
  - 迁移 `reset`, `updateStatus`, `updateProgress`, `updateDynamicTexts` 函数
  - 迁移视图切换逻辑（单图/批量预览）
  - **验证**: UI更新、重置功能正常
  - **依赖**: Task 1.2, Task 2.1
  - **预计影响**: app.js 减少约30行

- [x] **Task 4.2**: 提取图片渲染逻辑
  - 创建 `src/ui/imageRenderer.js`
  - 迁移 `createImageCard` 函数（182-203行）
  - 迁移图片卡片创建和更新逻辑
  - **验证**: 批量处理时图片卡片显示正常
  - **依赖**: Task 1.2
  - **预计影响**: app.js 减少约25行

### Phase 5: 配置和样式提取 (Configuration)

- [x] **Task 5.1**: 提取 Tailwind 配置
  - ~~创建 `src/config/tailwind.config.js`~~
  - ~~从 `index.html` 提取 14-34 行的配置~~
  - ~~在 HTML 中引用外部配置文件~~
  - **注**: 由于使用 Tailwind CDN，配置必须保留在 HTML 中，无需提取
  - **验证**: 样式显示正常，Tailwind 功能正常
  - **依赖**: 无
  - **预计影响**: 无

- [x] **Task 5.2**: 提取自定义样式
  - 创建 `public/styles.css`
  - 从 `index.html` 提取 36-80 行的样式定义
  - 在 HTML 中引用外部样式文件
  - **验证**: 所有自定义样式正常显示
  - **依赖**: 无
  - **预计影响**: index.html 减少约45行

### Phase 6: 重构主入口 (Main Entry)

- [x] **Task 6.1**: 重构 app.js 主入口
  - 简化 `init()` 函数，仅负责初始化协调
  - 简化 `setupEventListeners()`，委托给各个 handler
  - 移除已迁移的函数定义
  - **验证**: 应用初始化正常，所有功能正常
  - **依赖**: Task 3.1, Task 3.2, Task 3.3, Task 4.1, Task 4.2
  - **预计影响**: app.js 最终约80-100行（实际：83行）

### Phase 7: 验证和优化 (Validation)

- [x] **Task 7.1**: 完整功能测试
  - 测试单图上传和处理
  - 测试批量上传和处理
  - 测试下载功能（单个/批量）
  - 测试语言切换
  - 测试拖拽上传
  - 测试图片缩放预览
  - **验证**: 所有功能与重构前完全一致
  - **依赖**: 所有前置任务
  - **预计影响**: 无

- [x] **Task 7.2**: 构建流程验证
  - 运行 `pnpm dev` 验证开发模式
  - 运行 `pnpm build` 验证生产构建
  - 检查构建产物大小和结构
  - **验证**: 构建流程正常，产物正确
  - **依赖**: Task 7.1
  - **预计影响**: 无

- [x] **Task 7.3**: 代码质量检查
  - 检查所有模块的导入导出是否正确
  - 检查是否有未使用的代码
  - 检查代码风格一致性
  - **验证**: 代码质量符合项目规范
  - **依赖**: Task 7.2
  - **预计影响**: 无

## Parallelization Opportunities

以下任务可以并行执行：
- **Phase 1**: Task 1.1 和 Task 1.2 可以并行
- **Phase 2**: Task 2.1 可以与 Phase 1 并行
- **Phase 3**: Task 3.1, 3.2, 3.3 在各自依赖满足后可以并行
- **Phase 4**: Task 4.1 和 4.2 可以并行
- **Phase 5**: Task 5.1 和 5.2 可以并行

## Rollback Strategy

每个 Phase 完成后创建 git commit，如果出现问题可以回滚到上一个稳定状态：
- Phase 1 完成 → `git commit -m "refactor: create directory structure and extract DOM refs"`
- Phase 2 完成 → `git commit -m "refactor: extract state management"`
- Phase 3 完成 → `git commit -m "refactor: extract business logic handlers"`
- Phase 4 完成 → `git commit -m "refactor: extract UI controllers"`
- Phase 5 完成 → `git commit -m "refactor: extract configuration and styles"`
- Phase 6 完成 → `git commit -m "refactor: simplify main entry point"`
- Phase 7 完成 → `git commit -m "refactor: complete architecture refactoring"`

## Success Metrics

完成后的代码分布（实际结果）：
- `src/app.js`: 83 行（原293行，减少 210 行，-71.7%）
- `src/state/appState.js`: 41 行
- `src/ui/domRefs.js`: 19 行
- `src/ui/uiController.js`: 22 行
- `src/ui/imageRenderer.js`: 29 行
- `src/handlers/fileHandler.js`: 43 行
- `src/handlers/processHandler.js`: 102 行
- `src/handlers/downloadHandler.js`: 27 行
- `public/index.html`: 236 行（原280行，减少 44 行，-15.7%）
- `public/styles.css`: 43 行（新增）
- `src/config/tailwind.config.js`: 不需要（CDN 方式）

总代码量保持不变，但职责分离清晰，可维护性大幅提升。

✅ **所有目标均已达成：**
- ✅ app.js 从 293 行减少到 83 行
- ✅ index.html 从 280 行减少到 236 行
- ✅ 新增 8 个模块文件，总代码量基本不变
- ✅ 最大单文件不超过 150 行（processHandler.js: 102 行）
- ✅ 构建产物正常生成
- ✅ 每个模块职责单一清晰
- ✅ 模块间依赖关系明确
