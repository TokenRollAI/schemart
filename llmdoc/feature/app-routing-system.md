# App 路由系统设计

## 1. Purpose

Fast MVP 采用 Next.js 15 App Router 架构，通过路由组 (Route Groups) 设计分离客户端页面和服务端 API 的关注点，提供清晰的代码组织和高效的开发体验。

## 2. How it Works

### 2.1 路由组架构设计

**目录结构:**

```
src/app/
├── (pages)/                    # 客户端页面路由组
│   ├── layout.tsx             # 根布局组件
│   ├── globals.css            # 全局样式和主题定义
│   ├── page.tsx               # 首页
│   ├── openai/                # OpenAI 集成示例页面
│   ├── trpc/                  # tRPC 使用示例页面
│   └── magic/                 # MagicUI 动画组件演示页面
└── (server)/                   # 服务器端路由组
    └── api/
        └── trpc/
            └── [trpc]/        # tRPC HTTP API 端点
```

**路由组特点:**

- `(pages)/` - 专门存放客户端页面，清晰的 UI 层分离
- `(server)/` - 专门存放服务器端 API，逻辑层分离
- 括号命名确保不影响 URL 路径结构

### 2.2 根布局和主题系统

**根布局实现:**

```typescript
// src/app/(pages)/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { TRPCProvider } from '@/components/providers/TrpcProvider'

export const metadata: Metadata = {
  title: {
    default: 'Fast MVP - AI 应用快速开发模板',
    template: '%s | Fast MVP',
  },
  description: '基于 Next.js 15、tRPC 和多 AI Provider 的全栈应用模板，支持 OpenAI、Claude 和 Gemini',
  // ... 完整的 SEO metadata
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className='font-sans antialiased'>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
```

**主题系统设计:**

- 使用系统默认字体 `font-sans` 和 `antialiased` 样式
- 集成 TRPCProvider 为整个应用提供 tRPC 客户端
- 在 `globals.css` 中定义完整的主题变量系统
- 设置了完整的 SEO metadata 包括 OpenGraph 标签

**TRPCProvider 实现:**

```typescript
// src/components/providers/TrpcProvider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import superjson from 'superjson'

function getBaseUrl() {
  // 浏览器环境
  if (typeof window !== 'undefined') {
    return ''
  }
  // SSR环境
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // AI 响应不频繁变化，增加 staleTime 减少不必要的请求
            staleTime: 60 * 1000, // 1 分钟
            // AI API 调用成本高，失败后减少重试次数
            retry: 1,
            // 失败后不立即重试，避免浪费配额
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 5000),
          },
          mutations: {
            // mutation 失败后不自动重试，由用户决定
            retry: false,
          },
        },
      }),
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
```

**TRPCProvider 特点:**

- 支持 SSR 和浏览器环境的自动 URL 适配
- 使用 `superjson` 序列化复杂数据类型
- 针对 AI API 调用优化了查询缓存和重试策略
- 使用 `httpBatchLink` 批量处理请求以提高性能

### 2.3 页面组件实现模式

**服务端组件模式:**

```typescript
// src/app/(pages)/trpc/page.tsx
import HelloDemo from '@/components/helloDemo/HelloDemo'

export default function TrpcPage() {
  return (
    <div className='font-sans min-h-screen bg-background'>
      <main className='flex flex-col'>
        <div className='p-4 md:p-6'>
          <div className='max-w-6xl mx-auto'>
            <div className='mb-8 text-center'>
              <h1 className='text-4xl font-bold tracking-tight mb-4'>
                tRPC 示例演示
              </h1>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                这是一个完整的 tRPC + Zod + Drizzle ORM 的端到端类型安全示例，
                展示了如何构建现代化的全栈应用。
              </p>
            </div>
            <HelloDemo />
          </div>
        </div>
      </main>
    </div>
  )
}
```

**客户端组件模式:**

```typescript
// src/app/(pages)/page.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
// ... 其他导入

export default function HomePage() {
  return (
    <div className='font-sans min-h-screen bg-background relative overflow-hidden'>
      {/* 背景装饰和动画效果 */}
      <main className='relative z-10'>
        {/* Hero Section, Features Section, Footer 等内容 */}
      </main>
    </div>
  )
}
```

**带 Metadata 的页面模式:**

```typescript
// src/app/(pages)/openai/page.tsx
import type { Metadata } from 'next'
import { OpenAIChatDemo } from '@/components/chat/OpenAIChatDemo'

export const metadata: Metadata = {
  title: 'OpenAI 演示 | Fast MVP',
  description: '使用 Vercel AI SDK 调用 OpenAI 模型的入门示例',
}

export default function OpenAIPage() {
  return (
    <div className='mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 px-6 py-16'>
      <section className='space-y-6 text-center'>
        {/* 页面内容 */}
      </section>
      <div className='flex justify-center'>
        <OpenAIChatDemo />
      </div>
    </div>
  )
}
```

### 2.4 API 端点组织

**tRPC HTTP 端点:**

```typescript
// src/app/(server)/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/routers/_app'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  })

export { handler as GET, handler as POST }
```

**API 组织特点:**

- 简洁实现：使用 tRPC 的 fetch 适配器
- 统一入口：所有 tRPC 请求通过 `/api/trpc` 端点处理
- HTTP 方法支持：同时导出 GET 和 POST 处理器
- 集中化管理：通过 `appRouter` 统一管理所有路由

## 3. Relevant Code Modules

### 3.1 核心布局文件

- `src/app/(pages)/layout.tsx` - 应用根布局，集成 TRPCProvider 和完整 SEO metadata
- `src/app/(pages)/globals.css` - 全局样式和主题变量定义，包含完整渐变和阴影系统
- `src/app/(pages)/page.tsx` - 项目主页，使用客户端组件模式，集成动画效果和交互

### 3.2 示例页面组件

- `src/app/(pages)/openai/page.tsx` - OpenAI 集成演示页面，包含 metadata 配置
- `src/app/(pages)/trpc/page.tsx` - tRPC CRUD 操作演示页面，服务端组件模式
- `src/app/(pages)/magic/page.tsx` - MagicUI 动画组件演示页面

### 3.3 API 端点

- `src/app/(server)/api/trpc/[trpc]/route.ts` - tRPC HTTP 端点处理，支持 GET/POST 方法
- `src/server/routers/_app.ts` - 主路由聚合器，统一管理所有 API 路由
- `src/server/routers/` - 各功能路由定义目录

### 3.4 Provider 组件

- `src/components/providers/TrpcProvider.tsx` - tRPC 客户端 Provider，包含查询优化配置
- `src/lib/trpc/client.ts` - tRPC 客户端配置
- `src/lib/trpc/server.ts` - tRPC 服务端配置

### 3.5 功能组件

- `src/components/chat/` - AI 聊天功能相关组件
- `src/components/helloDemo/` - CRUD 演示组件
- `src/components/magicui/` - MagicUI 动画组件库
- `src/components/ui/` - shadcn/ui 基础组件

## 4. Attention

- **路由组规范**: 新页面必须遵循现有的 Route Groups 组织模式，使用 `(pages)` 和 `(server)` 分离关注点
- **主题系统使用**: 新增页面应使用主题类（如 `bg-primary`、`text-gradient-warm`）而非硬编码颜色
- **组件化设计**: 页面应采用简洁的组件组合模式，复用现有 UI 组件
- **API 统一**: 所有 API 调用应通过 tRPC 架构保持类型安全，使用 TRPCProvider 提供的客户端
- **响应式设计**: 所有页面都需要支持移动端适配，使用 Tailwind 响应式类
- **SEO 优化**: 页面组件应设置合适的 metadata，特别是公开访问的页面
- **客户端组件**: 需要交互或状态管理的页面必须使用 `'use client'` 指令
- **字体和样式**: 统一使用 `font-sans antialiased` 基础样式，确保视觉一致性
