# Proposal: Refactor App Architecture

## Change ID
`refactor-app-architecture`

## Summary
重构项目架构以解决 `app.js` 职责过重和 `index.html` 实现复杂的问题。通过模块化拆分和职责分离，提升代码可维护性和可读性，同时保持所有功能逻辑完全不变。

## Problem Statement

### Current Issues
1. **app.js 职责过重** ([app.js:293](src/app.js))
   - 混合了全局状态管理、DOM引用、事件处理、业务逻辑、UI更新等多个职责
   - 293行代码包含了10+个函数，职责边界不清晰
   - 难以测试和维护

2. **index.html 实现复杂** ([index.html:280](public/index.html))
   - 包含内联的 Tailwind 配置（14-34行）
   - 包含大量内联样式定义（36-80行）
   - HTML结构与配置耦合，不利于维护

### Impact
- 代码可读性差，新功能开发困难
- 职责不清晰，容易引入bug
- 难以进行单元测试
- 配置和样式分散，修改成本高

## Proposed Solution

### Architecture Changes
将 `app.js` 按职责拆分为以下模块：

```
src/
├── app.js                    # 应用入口，仅负责初始化和协调
├── state/
│   └── appState.js          # 全局状态管理
├── ui/
│   ├── domRefs.js           # DOM元素引用集中管理
│   ├── uiController.js      # UI控制器（显示/隐藏、更新UI）
│   └── imageRenderer.js     # 图片渲染逻辑
├── handlers/
│   ├── fileHandler.js       # 文件处理（上传、拖拽、验证）
│   ├── processHandler.js    # 图片处理逻辑（单图/批量）
│   └── downloadHandler.js   # 下载逻辑（单个/批量）
└── config/
    └── tailwind.config.js   # Tailwind配置提取
```

将 `index.html` 简化：
- 提取 Tailwind 配置到独立文件
- 提取内联样式到独立 CSS 文件
- 保持 HTML 结构不变，仅移除配置代码

### Key Principles
1. **单一职责原则**：每个模块只负责一个明确的功能领域
2. **依赖注入**：通过参数传递依赖，而非全局引用
3. **保持功能不变**：重构过程中不改变任何业务逻辑
4. **渐进式重构**：可以分步骤实施，每步都可独立验证

## Benefits
- **可维护性提升**：职责清晰，修改影响范围可控
- **可读性提升**：每个文件职责单一，代码量减少
- **可测试性提升**：模块化后便于编写单元测试
- **开发效率提升**：新功能开发时更容易定位代码位置

## Risks and Mitigations

### Risks
1. **重构引入bug**：拆分过程中可能破坏现有功能
2. **构建配置变更**：新增文件可能需要调整构建流程
3. **开发习惯改变**：团队需要适应新的代码组织方式

### Mitigations
1. 每个拆分步骤后进行功能验证
2. 保持构建配置向后兼容
3. 提供清晰的模块职责文档

## Alternatives Considered

### Alternative 1: 保持现状
- **优点**：无需投入重构成本
- **缺点**：技术债持续累积，未来维护成本更高
- **结论**：不可取，问题会随着功能增加而恶化

### Alternative 2: 完全重写
- **优点**：可以采用最佳实践从头设计
- **缺点**：风险高，成本大，可能引入新bug
- **结论**：过度工程化，不符合项目简洁原则

### Alternative 3: 渐进式重构（选择方案）
- **优点**：风险可控，可分步验证，保持功能稳定
- **缺点**：需要一定时间完成
- **结论**：最佳方案，平衡了风险和收益

## Dependencies
- 无外部依赖变更
- 无需新增npm包
- 构建工具（esbuild）配置可能需要微调

## Success Criteria
1. ✅ app.js 拆分为6+个职责单一的模块
2. ✅ index.html 移除所有内联配置和样式
3. ✅ 所有现有功能正常工作（单图上传、批量上传、下载、语言切换等）
4. ✅ 构建流程正常运行（dev/build命令）
5. ✅ 代码行数分布更均衡（无单文件超过150行）

## Related Changes
无

## References
- 当前实现：[src/app.js](../../src/app.js)
- 当前HTML：[public/index.html](../../public/index.html)
- 项目约定：[openspec/project.md](../project.md)
