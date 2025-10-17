# 项目整体架构

## 1. Purpose

描述 Schemart 项目的整体架构设计，包含技术栈选择、目录结构组织和核心模块划分，为开发者提供系统的架构认知和开发指导。

## 2. How it Works

### 技术栈架构

项目采用现代化的全栈技术架构，确保高性能、类型安全和开发体验：

**前端技术栈：**
- **Next.js 15.5.6** (App Router) - 提供服务端渲染和路由功能
- **React 19.2.0** - 用户界面构建，支持最新的并发特性
- **TypeScript 5.9.3** - 静态类型检查和开发时类型提示
- **Tailwind CSS 4.1.14** - 原子化 CSS 框架，支持快速样式开发
- **@radix-ui/themes 3.2.1** - 高质量 UI 组件库基础
- **@tanstack/react-query 5.90.5** - 服务端状态管理和缓存
- **Framer Motion 12.23.24** - 动画和交互效果

**后端技术栈：**
- **tRPC 11.6.0** - 端到端类型安全的 API 框架
- **Zod 4.1.12** - 运行时数据验证和类型推断
- **Drizzle ORM 0.44.6** - 类型安全的数据库操作层
- **@libsql/client 0.15.15** - SQLite 数据库客户端
- **AI SDK 5.0.76** - 统一的 AI 提供商接口

**AI 集成支持：**
- **@ai-sdk/openai 2.0.52** - OpenAI GPT 模型集成
- **@ai-sdk/anthropic 2.0.33** - Claude 模型集成
- **@ai-sdk/google 2.0.23** - Gemini 模型集成

### 目录结构设计

```
src/
├── app/                    # Next.js App Router 应用路由
│   ├── (pages)/           # 前端页面路由组
│   │   ├── globals.css    # 全局样式和 Neo-Brutalism 设计系统
│   │   ├── layout.tsx     # 根布局组件，集成字体和主题
│   │   ├── page.tsx       # 主页，项目管理界面
│   │   ├── project/       # 项目管理相关页面
│   │   │   ├── [id]/      # 项目详情页面
│   │   │   └── [id]/generate/ # AI 生成功能页面
│   │   └── table/         # 表管理相关页面
│   │       ├── [id]/      # 表详情页面
│   │       └── [id]/edit/ # 表编辑页面
│   └── (server)/          # 服务端 API 路由组
│       └── api/trpc/[trpc]/ # tRPC HTTP 端点
├── components/            # 可复用组件库
│   ├── chat/             # 聊天功能组件
│   ├── helloDemo/        # 演示组件
│   ├── providers/        # React Context 提供者
│   └── ui/               # 基础 UI 组件
├── lib/                  # 共享库和工具函数
│   ├── ai/providers/     # AI 提供商抽象层
│   ├── schema/           # Zod 验证 schema
│   ├── trpc/             # tRPC 客户端配置
│   └── utils/            # 通用工具函数
├── server/               # 服务端业务逻辑
│   └── routers/          # tRPC 路由定义
├── db/                   # 数据库层
│   └── schema/           # 数据表结构定义
└── types/                # 全局 TypeScript 类型
```

### 架构分层设计

**1. 表现层 (Presentation Layer)**
- 基于 Next.js App Router 的页面组件
- 使用 Radix UI Themes + Neo-Brutalism 设计系统
- React Query 管理服务端状态
- 响应式设计和交互优化

**2. 业务逻辑层 (Business Logic Layer)**
- tRPC 路由处理 API 请求
- Zod schema 进行数据验证
- AI 功能集成和提示词工程
- 业务规则和流程控制

**3. 数据访问层 (Data Access Layer)**
- Drizzle ORM 进行数据库操作
- 类型安全的查询和事务处理
- 数据库连接管理和配置
- 迁移和 schema 管理

**4. 基础设施层 (Infrastructure Layer)**
- 环境变量配置和验证
- AI 提供商抽象和工厂模式
- 错误处理和日志记录
- 缓存和性能优化

### 核心模块组织

**AI 功能模块：**
- `src/lib/ai/providers/` - AI 提供商抽象层
- `src/server/routers/schemart-ai.ts` - AI 路由处理
- 提示词工程和上下文管理
- 多轮对话和结果解析

**数据管理模块：**
- `src/db/` - 数据库 schema 和连接
- `src/server/routers/schemart.ts` - 核心 CRUD 路由
- `src/lib/schema/` - 数据验证 schema
- 版本控制和历史记录

**工具功能模块：**
- `src/server/routers/schemart-tools.ts` - 工具功能路由
- SQL 生成和导出功能
- 项目导入导出处理
- 数据格式转换

**用户界面模块：**
- `src/app/(pages)/` - 页面组件
- `src/components/` - 可复用组件
- Neo-Brutalism 设计系统
- 交互状态和反馈

## 3. Relevant Code Modules

### 核心应用文件
- `src/app/(pages)/layout.tsx` - 根布局，集成字体、主题、tRPC 提供者
- `src/app/(pages)/globals.css` - Neo-Brutalism 设计系统定义
- `src/app/(pages)/page.tsx` - 主页，项目管理界面实现
- `src/app/(server)/api/trpc/[trpc]/route.ts` - tRPC HTTP 端点

### 数据层核心
- `src/db/db.ts` - 数据库连接管理和配置
- `src/db/schema/schemart.ts` - 核心业务表结构定义
- `src/lib/env.ts` - 环境变量验证和配置管理

### API 路由核心
- `src/server/routers/_app.ts` - 主路由聚合器
- `src/server/routers/schemart.ts` - 核心业务逻辑路由
- `src/server/routers/schemart-ai.ts` - AI 功能路由
- `src/server/routers/schemart-tools.ts` - 工具功能路由

### AI 集成核心
- `src/lib/ai/providers/index.ts` - AI 提供商工厂函数
- `src/lib/ai/providers/openai.ts` - OpenAI 集成实现
- `src/lib/ai/providers/claude.ts` - Claude 集成实现
- `src/lib/ai/providers/gemini.ts` - Gemini 集成实现

### 类型验证核心
- `src/lib/schema/schemart.ts` - 核心业务数据验证 schema
- `src/lib/trpc/client.ts` - tRPC 客户端配置
- `src/components/providers/TrpcProvider.tsx` - tRPC React Query 集成

## 4. Attention

- 项目使用 SQLite 作为元数据存储，注意数据类型映射和 SQL 语法差异
- 布尔值使用整数存储（0/1），前后端需要进行类型转换
- AI 提示词需要根据模型更新进行调整，确保生成质量
- Neo-Brutalism 设计系统使用 CSS 变量，修改主题时需要同步更新相关文件
- tRPC 路由修改后需要重新生成客户端类型，确保类型安全
- 数据库 schema 变更需要手动管理迁移文件，注意数据兼容性