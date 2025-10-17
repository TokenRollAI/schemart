# Fast MVP 整体架构设计

## 1. Purpose

Fast MVP 是一个基于 Next.js 15.5.2 的全栈 AI 应用开发模板，专为快速原型开发和 AI 辅助编程设计。项目采用现代化技术栈，提供完整的前后端类型安全、多 AI 提供商支持、优雅的 UI 主题系统和高效开发工作流程。

## 2. How it Works

### 2.1 技术栈架构

**前端技术栈:**

- Next.js 15.5.2 (App Router) + React 19.1.0 - 现代化全栈框架
- TypeScript 5.x - 严格类型安全保障
- Tailwind CSS 4 + 自定义主题系统 - 一致的视觉设计
- shadcn/ui + Radix UI - 高质量 UI 组件库
- MagicUI - 动画组件库
- TanStack Query 5.85.5 - 数据状态管理

**后端技术栈:**

- tRPC 11.5.0 - 端到端类型安全 API
- Zod 3.25.76 - 运行时数据验证
- Drizzle ORM 0.44.5 + SQLite/libSQL 0.15.14 - 类型安全的数据库层
- Vercel AI SDK 5.0.28 - 统一的 AI 提供商接口

**AI 提供商支持:**

- OpenAI (默认: gpt-4o-mini, gpt-4o)
- Anthropic Claude (默认: claude-3-5-sonnet-latest)
- Google Gemini (默认: gemini-2.0-flash-001)

### 2.2 目录结构设计

```
src/
├── app/                    # Next.js App Router 路由层
│   ├── (pages)/           # 前端页面路由组
│   │   ├── globals.css    # 全局样式 + 主题变量
│   │   ├── layout.tsx     # 根布局
│   │   ├── page.tsx       # 主页
│   │   ├── openai/        # OpenAI 聊天演示页面
│   │   ├── magic/         # MagicUI 动画演示页面
│   │   └── trpc/          # tRPC 演示页面
│   └── (server)/          # 服务端 API 路由组
│       └── api/trpc/[trpc]/ # tRPC HTTP 端点
├── components/            # 可复用组件库
│   ├── ui/               # shadcn/ui 基础组件
│   ├── magicui/          # MagicUI 动画组件
│   ├── providers/        # React Context 提供者
│   ├── chat/             # 聊天功能组件
│   └── trpc/             # tRPC 演示组件
├── lib/                  # 共享库和工具
│   ├── ai/providers/     # AI 提供商抽象层
│   ├── schema/           # Zod 验证 schema (hello.ts, chat.ts)
│   ├── trpc/             # tRPC 客户端配置
│   ├── utils/            # 通用工具函数
│   └── env.ts            # 环境变量验证
├── server/               # 服务端业务逻辑
│   ├── trpc.ts           # tRPC 服务器配置
│   └── routers/          # tRPC 路由定义 (hello.ts, chat.ts, _app.ts)
├── db/                   # 数据库层
│   ├── db.ts             # 数据库连接实例
│   └── schema/           # 数据表定义 (hello.ts)
├── types/                # 全局 TypeScript 类型 (example.d.ts)
└── index.d.ts            # 全局类型声明
```

### 2.3 核心架构特点

**路由组 (Route Groups) 设计:**

- `(pages)/` - 客户端页面，专注于 UI 和用户体验
  - 包含演示页面: `page.tsx`, `openai/`, `magic/`, `trpc/`
- `(server)/` - 服务端 API，专注于业务逻辑和数据处理
  - 仅包含 tRPC HTTP 端点: `api/trpc/[trpc]/route.ts`

**AI 提供商抽象层:**

```typescript
// 统一接口，支持多提供商
import { resolveLanguageModel } from '@/lib/ai/providers'
const model = resolveLanguageModel(provider, model?)
// 支持: 'openai' | 'claude' | 'gemini'
```

**端到端类型安全:**

- tRPC: 前后端共享类型定义，使用 superjson 序列化
- Zod: 运行时数据验证和错误格式化
- TypeScript: 编译时类型检查

### 2.4 开发工作流程

**环境准备 (2 分钟):**

```bash
pnpm install
cp .env.example .env.local  # 配置 AI API 密钥
pnpm db:push              # 推送数据库 schema
pnpm dev                  # 启动开发服务器 (Turbopack)
```

**快速开发 (30 分钟):**

1. 分析需求类型，选择对应模式
2. 复制现有模式进行适配 (从 `openai/`, `trpc/`, `magic/` 选择)
3. 创建 tRPC 路由和 Zod schema (参考 `hello.ts`, `chat.ts`)
4. 使用现有组件库构建 UI (优先 shadcn/ui，其次 MagicUI)
5. 在 `src/server/routers/_app.ts` 注册路由并测试集成

## 3. Relevant Code Modules

### 3.1 核心配置文件

- `src/app/(pages)/layout.tsx` - 应用根布局，集成 TRPCProvider
- `src/app/(pages)/globals.css` - 完整的主题系统定义 (深色调 + 温暖渐变)
- `src/app/(server)/api/trpc/[trpc]/route.ts` - tRPC HTTP 端点
- `src/lib/env.ts` - 环境变量验证和类型定义 (Zod schema)

### 3.2 tRPC 系统

- `src/server/trpc.ts` - tRPC 核心配置，superjson 序列化，Zod 错误格式化
- `src/server/routers/_app.ts` - 主路由聚合器 (hello, chat)
- `src/lib/trpc/client.ts` - tRPC React 客户端配置
- `src/components/providers/TrpcProvider.tsx` - React Query 集成的 Provider

### 3.3 AI 提供商系统

- `src/lib/ai/providers/index.ts` - AI 提供商工厂函数 resolveLanguageModel()
- `src/lib/ai/providers/openai.ts` - OpenAI 集成 (默认 gpt-4o-mini)
- `src/lib/ai/providers/claude.ts` - Claude 集成 (默认 claude-3-5-sonnet-latest)
- `src/lib/ai/providers/gemini.ts` - Gemini 集成 (默认 gemini-2.0-flash-001)

### 3.4 数据库层

- `src/db/db.ts` - 数据库连接管理 (SQLite/libSQL 单例模式)
- `src/db/schema/hello.ts` - hello 数据表定义
- `drizzle.config.ts` - Drizzle ORM 配置 (SQLite 方言)

### 3.5 验证系统

- `src/lib/schema/hello.ts` - hello 功能 Zod 验证 schema
- `src/lib/schema/chat.ts` - chat 功能 Zod 验证 schema
- `src/server/routers/hello.ts` - hello 路由业务逻辑
- `src/server/routers/chat.ts` - chat 路由业务逻辑

## 4. Attention

- **严格主题系统**: 禁止硬编码颜色，必须使用语义化主题类 (primary, secondary, accent, muted, card)
- **AI 提供商约束**: 必须使用 `resolveLanguageModel()` 工厂函数，不能直接处理 API 密钥
- **组件优先级**: 优先使用 shadcn/ui，其次 MagicUI，最后自定义组件
- **数据库约束**: 开发环境使用 `pnpm db:push`，生产环境需要确认后生成迁移
- **类型安全**: 所有 API 调用必须通过 tRPC 保持类型安全，使用 Zod 验证
- **开发规范**: 使用 `pnpm` 而非 npm/yarn，开发时使用 `pnpm dev` (Turbopack)
- **Turbopack 支持**: 构建和开发都使用 Turbopack (`--turbopack` 参数)
- **环境变量**: 必须从 `.env.example` 复制到 `.env.local`，至少配置一个 AI 提供商 API 密钥
