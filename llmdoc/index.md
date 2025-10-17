# Schemart 项目文档索引

Schemart 是一个基于 AI 的数据库表结构管理工具，采用 Next.js 15 + React 19 + tRPC + AI 技术栈构建的现代化全栈应用。

## 📋 项目概述

**核心功能：**
- AI 智能生成数据库表结构（支持 OpenAI、Claude、Gemini）
- 完整的表结构 CRUD 操作和版本控制
- 多数据库 SQL 生成（MySQL、PostgreSQL、SQLite）
- 项目导入导出和团队协作支持

**技术栈：**
- 前端：Next.js 15.5.6 + React 19.2.0 + TypeScript 5.9.3
- 后端：tRPC 11.6.0 + Zod 4.1.12 + Drizzle ORM 0.44.6
- AI 集成：Vercel AI SDK 5.0.76 + 多提供商支持
- UI 框架：Radix UI Themes 3.2.1 + Tailwind CSS 4.1.14 + Neo-Brutalism 设计系统

## 🏗️ 架构文档

### [项目整体架构](./feature/project-architecture.md)

基于 Next.js App Router 的全栈架构设计，包含技术栈版本说明、目录结构分析和模块组织方式

### [数据库设计](./feature/database-design.md)

完整的数据库表结构设计，包含项目、表、列、索引、历史记录等核心表的设计和关系

### [AI 集成系统](./feature/ai-integration-system.md)

多 AI 提供商抽象层设计，支持 OpenAI、Claude、Gemini 的统一接口和配置管理

### [tRPC API 路由](./feature/trpc-api-routes.md)

完整的 tRPC 路由系统设计，包含核心业务逻辑、数据验证和错误处理

### [Neo-Brutalism 设计系统](./feature/neo-brutalism-design-system.md)

完整的设计系统架构，包含设计理念、CSS 类系统、设计令牌和使用规范

### [前端页面架构](./feature/frontend-page-architecture.md)

基于 Next.js App Router 的页面设计，包含路由结构、组件层级和交互流程

## 🔧 核心功能模块

### [AI 表结构生成](./feature/ai-table-generation.md)

AI 生成表结构的核心实现，包含提示词工程、上下文感知和多轮对话功能

### [表结构管理](./feature/table-structure-management.md)

完整的表结构 CRUD 操作，包含项目、表、列、索引的增删改查和级联操作

### [版本控制系统](./feature/version-control-system.md)

表结构变更历史记录和快照管理，支持完整的版本追踪和回滚

### [SQL 生成引擎](./feature/sql-generation-engine.md)

多数据库 SQL 生成功能，支持 MySQL、PostgreSQL、SQLite 的语法优化

### [导入导出功能](./feature/import-export-features.md)

项目数据的导入导出功能，支持 JSON 格式的数据交换和版本迁移

## 📚 开发指南

### [项目初始化](./sop/project-initialization.md)

新项目环境搭建流程，包含依赖安装、数据库配置和 AI 提供商设置

### [开发工作流](./sop/development-workflow.md)

标准的开发流程和代码规范，包含功能开发、测试和部署的完整指南

### [AI 功能集成](./sop/ai-feature-integration.md)

AI 功能的开发和集成流程，包含新的 AI 提供商接入和功能扩展

### [数据库操作](./sop/database-operations.md)

数据库迁移、schema 更新和数据操作的安全流程和最佳实践

## 🛠️ 技术参考

### [环境变量配置](./feature/environment-configuration.md)

完整的环境变量配置和验证系统，包含数据库连接和 AI 提供商配置

### [类型安全系统](./feature/type-safety-system.md)

端到端的类型安全保障，包含 TypeScript、tRPC、Zod 的类型安全实现

### [错误处理机制](./feature/error-handling-mechanism.md)

统一的错误处理和用户反馈机制，包含前后端错误处理策略

### [性能优化策略](./feature/performance-optimization.md)

应用性能优化策略，包含缓存机制、代码分割和数据库查询优化

---

## 文档使用指南

### 📖 如何使用这些文档

1. **新开发者入门**: 从 [项目整体架构](./feature/project-architecture.md) 开始，了解系统设计
2. **功能开发**: 参考 [开发工作流](./sop/development-workflow.md) 和对应的功能模块文档
3. **问题排查**: 根据问题类型查阅对应的技术文档或操作指南
4. **AI 集成**: 参考 [AI 功能集成](./sop/ai-feature-integration.md) 和 [AI 集成系统](./feature/ai-integration-system.md)

### 🎯 文档定位

- **架构文档** (`/feature/`): 详细的系统设计和实现指南
- **操作流程** (`/sop/`): 标准化的开发和工作流程
- **技术参考**: 具体的技术实现细节和最佳实践

### 🔄 文档更新

所有文档都基于项目的实际代码分析生成，与代码实现保持同步。当项目架构或实现发生变化时，相关文档需要同步更新。