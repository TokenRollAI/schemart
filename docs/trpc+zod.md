# 在本项目中使用 tRPC + Zod 的团队指南

本文档旨在为团队成员提供在项目中统一、高效地使用 tRPC 和 Zod 构建端到端类型安全 API 的最佳实践。

## 1. 核心理念：端到端的类型安全

在本项目中，我们选择 tRPC + Zod 的组合，是为了实现真正的 **端到端类型安全**。

- **tRPC**：让我们能像调用本地函数一样调用后端 API，无需编写任何 API 定义文件（如 OpenAPI/Swagger）。客户端和服务端共享类型，重构后端 API 会立即在前端产生 TypeScript 编译错误，消除了前后端不匹配的风险。
- **Zod**：作为 tRPC 的校验层，它在保证运行时数据安全的同时，其 schema 定义还能被 tRPC 用来自动推断出 TypeScript 类型。

**我们遵循的核心原则是：一次定义，全栈共享。**

## 2. 项目架构概览

我们项目中的 tRPC 结构分为清晰的几个部分：

1.  **后端核心 (`src/server/trpc.ts`)**:
    - 初始化 tRPC 实例。
    - 配置 `superjson` 以支持复杂数据类型序列化。
    - 配置 `errorFormatter` 以便将 Zod 校验错误友好地返回给前端。

2.  **API 路由 (`src/app/(server)/api/trpc/[trpc]/route.ts`)**:
    - 标准的 Next.js App Router 路由处理器，将所有 `/api/trpc/*` 的请求转发给 tRPC 处理。

3.  **Schema 定义 (`src/lib/schema/`)**:
    - **所有 Zod schema 的存放地**。按功能模块划分文件（如 `hello.ts`），用于定义 tRPC procedure 的输入校验规则并导出推断出的 TypeScript 类型。

4.  **后端路由 (`src/server/routers/`)**:
    - `_app.ts`: 根路由，将所有功能模块的子路由（如 `helloRouter`）合并到 `appRouter` 中。
    - `hello.ts`: 功能模块路由示例，定义具体的 `query` (查询) 和 `mutation` (变更)。

5.  **前端客户端 (`src/lib/trpc/client.ts`)**:
    - 创建 tRPC 的 React Query 客户端 (`createTRPCReact`)，让前端能以 hooks 的方式调用 API。

6.  **前端 Provider (`src/components/providers/TrpcProvider.tsx`)**:
    - 在应用根部设置 `QueryClientProvider` 和 `trpc.Provider`，为整个应用提供 tRPC 和 React Query 的上下文。

## 3. 最佳实践：端到端开发流程

当需要添加一个新的 API 功能时（例如，创建一个新的 `user` 模块），请严格遵循以下步骤。我们将以 `hello` 模块为例进行说明。

### 第 1 步：定义 Schema (Zod)

在 `src/lib/schema/` 目录下，为你的新模块创建一个 schema 文件，例如 `hello.ts`。

- **定义输入 schema**: 使用 `z.object()` 为每个 procedure 定义输入参数和校验规则。
- **推断并导出类型**: 使用 `z.infer` 从 schema 自动生成 TypeScript 类型，并导出。

```typescript
// src/lib/schema/hello.ts
import { z } from 'zod'

export const helloInputSchema = {
  sayHello: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
  getCount: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
}

export type SayHelloInput = z.infer<typeof helloInputSchema.sayHello>
export type GetCountInput = z.infer<typeof helloInputSchema.getCount>
```

### 第 2 步：创建后端路由

在 `src/server/routers/` 目录下创建你的模块路由文件，例如 `hello.ts`。

- **导入 `router` 和 `publicProcedure`**。
- **导入你刚创建的 Zod schema**。
- 使用 `.input(schema)` 来应用校验。
- 编写 `query` (用于数据查询) 或 `mutation` (用于数据增删改) 的具体逻辑。

```typescript
// src/server/routers/hello.ts
import { publicProcedure, router } from '../trpc'
import { helloInputSchema } from '@/lib/schema/hello'
import { db, helloTable } from '@/db/db'
// ...

export const helloRouter = router({
  // 一个 mutation 示例
  sayHello: publicProcedure
    .input(helloInputSchema.sayHello) // 应用 Zod schema
    .mutation(async ({ input }) => {
      // 'input' 此时已是类型安全的 SayHelloInput
      // ... 业务逻辑 ...
      return { message: `Hello ${input.name}!` }
    }),

  // 一个 query 示例
  getCount: publicProcedure
    .input(helloInputSchema.getCount)
    .query(async ({ input }) => {
      // ... 业务逻辑 ...
      return { count: 5 }
    }),
})
```

### 第 3 步：合并到主路由

将你新创建的子路由合并到主路由 `_app.ts` 中。

```typescript
// src/server/routers/_app.ts
import { router } from '../trpc'
import { helloRouter } from './hello'
// import { yourNewRouter } from './yourNewRouter'; // 导入你的新路由

export const appRouter = router({
  hello: helloRouter,
  // yourModule: yourNewRouter, // 在这里挂载
})

export type AppRouter = typeof appRouter // 导出类型是关键！
```

**关键**：`export type AppRouter` 会将整个后端 API 的类型结构暴露给前端。

### 第 4 步：在前端组件中使用

现在，你可以在任何客户端组件中安全地调用你新创建的 API。

- **导入 tRPC 客户端**: `import { trpc } from '@/lib/trpc/client';`
- **使用 hooks**: tRPC 提供了与 React Query 完全一致的 hooks。
  - `trpc.moduleName.procedureName.useQuery()` 用于调用 `query`。
  - `trpc.moduleName.procedureName.useMutation()` 用于调用 `mutation`。

```tsx
// src/components/helloDemo/HelloDemo.tsx
'use client'

import { trpc } from '@/lib/trpc/client'
import { useState } from 'react'

export default function HelloDemo() {
  const [name, setName] = useState('')

  // 1. 调用 Mutation
  const sayHelloMutation = trpc.hello.sayHello.useMutation()

  // 2. 调用 Query
  const getCountQuery = trpc.hello.getCount.useQuery(
    { name: 'world' }, // 输入参数，类型安全
    { enabled: false }, // React Query 选项
  )

  const handleSayHello = () => {
    sayHelloMutation.mutate({ name }) // 输入参数，类型安全
  }

  return (
    <div>
      {/* 自动获得加载状态 */}
      {sayHelloMutation.isPending && <p>Saving...</p>}

      {/* 自动获得返回数据和类型提示 */}
      {sayHelloMutation.data && <p>{sayHelloMutation.data.message}</p>}

      {/* ... */}
    </div>
  )
}
```

**核心优势体现**：

- 在 `trpc.hello.sayHello...` 这一行，`hello` 和 `sayHello` 都有自动补全。
- `useQuery` 和 `mutate` 的参数 `{ name: '...' }` 会受到严格的类型检查，如果拼写错误或类型错误，会直接报 TS 错误。
- 返回的 `data` 对象（如 `sayHelloMutation.data`）的类型也是完全推断出来的，`data.message` 会有智能提示。

## 4. 官方文档

- **tRPC 官方文档**: [https://trpc.io/](https://trpc.io/)
- **Zod 官方文档**: [https://zod.dev/](https://zod.dev/)
