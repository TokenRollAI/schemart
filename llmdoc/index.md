# Fast MVP 项目文档索引

这是 Fast MVP 项目的核心文档系统，为开发者提供完整的技术实现指南和架构参考。

## 🏗️ 架构文档

### [整体架构设计](./feature/architecture-overview.md)

基于实际代码验证的项目整体架构设计，包含精确的技术栈版本(Next.js 15.5.2、React 19.1.0)、目录结构和开发工作流程指南

### [App 路由系统](./feature/app-routing-system.md)

基于实际代码验证的 Next.js App Router 路由组设计、页面组件实现模式和 API 端点组织

### [服务端架构](./feature/server-architecture.md)

tRPC 路由组织、数据验证机制和错误处理策略

### [AI 提供者系统](./feature/ai-provider-system.md)

多 AI 提供商抽象层设计、工厂模式实现和配置管理，基于实际代码验证的完整技术文档

### [组件架构](./feature/component-architecture.md)

基于实际代码验证的 UI 组件库组织、Radix UI Themes 集成和 Provider 组件实现指南

### [Neo-Brutalism 设计系统](./feature/neo-brutalism-design-system.md)

完整的设计系统架构文档，包含设计理念、CSS 类系统、设计令牌和使用规范

### [架构变更记录](./feature/architecture-changes-log.md)

项目重要架构变更历史记录，包含组件库迁移、设计系统演进和技术影响分析

### [最近架构变更](./feature/recent-architecture-changes.md)

2025年1月重要架构变更记录，包含环境变量验证修复、组件库迁移到 Radix UI Themes、Neo-Brutalism 设计系统引入和依赖版本升级

### [Radix UI 使用指南](./feature/radix-ui-usage-guide.md)

完整的 Radix UI Themes 使用指南，包含组件示例、图标系统、主题定制和最佳实践

### [数据库与配置](./feature/database-configuration.md)

数据库层设计、环境变量管理和项目配置系统

### [环境变量验证系统](./feature/environment-variables-validation.md)

详细的环境变量验证系统设计，包含 Zod 4.x URL 验证修复和类型安全保障

## 🔧 开发流程

### [项目初始化流程](./sop/project-initialization.md)

基于实际配置的新项目环境搭建流程，包含Node.js 20+、pnpm 10+版本要求、数据库初始化和AI提供商配置步骤

### [添加新功能流程](./sop/feature-development.md)

基于实际代码验证的标准化新功能开发流程，包含页面路由、tRPC路由、Schema验证和组件实现的完整指南

### [AI 功能集成流程](./sop/ai-integration.md)

基于实际代码验证的 AI 功能集成流程，包含提供商配置、路由实现和错误处理的完整指南

### [主题系统使用规范](./sop/theme-system-usage.md)

正确使用项目主题系统的开发规范和最佳实践

## 📋 标准操作程序 (SOP)

### [代码提交规范](./sop/code-commit-guidelines.md)

基于实际项目配置验证的 Git 提交规范，包含代码质量工具配置、提交风格和项目特定要求

### [数据库操作流程](./sop/database-operations.md)

数据库迁移、schema 更新和数据操作的安全流程

### [部署和发布流程](./sop/deployment-process.md)

生产环境部署、版本发布和监控配置的标准程序

## 🎯 核心特性指南

### [tRPC 类型安全开发](./feature/trpc-type-safety.md)

端到端类型安全开发、schema 定义和 API 设计模式

### [响应式设计实现](./feature/responsive-design.md)

移动端适配、断点设计和响应式组件开发指南

### [动画效果集成](./feature/animation-integration.md)

Framer Motion、MagicUI 组件和自定义动画的实现方法

---

## 文档使用指南

### 📖 如何使用这些文档

1. **新开发者入门**: 从 [整体架构设计](./feature/architecture-overview.md) 开始，然后阅读相关的 SOP 文档
2. **功能开发**: 参考 [添加新功能流程](./sop/feature-development.md) 和相应的特性文档
3. **问题排查**: 根据问题类型查阅对应的技术文档或 SOP
4. **代码规范**: 遵循 [代码提交规范](./sop/code-commit-guidelines.md) 和 [主题系统使用规范](./sop/theme-system-usage.md)

### 🎯 文档定位

- **技术文档** (`/feature/`): 详细的架构设计和实现指南
- **操作流程** (`/sop/`): 标准化的开发和工作流程
- **开发者参考**: 专注于代码设计、架构实现和维护，不包含教程内容

### 🔄 文档更新

所有文档都基于项目的实际代码分析生成，与代码实现保持同步。当项目架构或实现发生变化时，相关文档需要同步更新。
