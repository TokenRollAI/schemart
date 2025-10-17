# tRPC API 路由

## 1. Purpose

详细描述 Schemart 项目的 tRPC API 路由系统设计，包含路由架构、数据验证、错误处理和类型安全保障，为 API 开发和维护提供技术参考。

## 2. How it Works

### tRPC 架构概览

项目采用 tRPC 实现端到端类型安全的 API 系统，通过 Next.js App Router 提供统一的 HTTP 端点，支持自动类型推断和序列化。

**核心架构模式：**
```
Client Request → tRPC Client → HTTP Endpoint → tRPC Server → Router → Procedure → Response
```

### 路由组织架构

#### 主路由聚合器
```typescript
// src/server/routers/_app.ts
export const appRouter = router({
  hello: helloRouter,
  chat: chatRouter,
  schemart: schemartRouter,
  schemartAI: schemartAIRouter,
  schemartTools: schemartToolsRouter,
})

export type AppRouter = typeof appRouter
```

**路由模块划分：**
- `helloRouter` - 演示和测试功能
- `chatRouter` - 聊天功能
- `schemartRouter` - 核心业务 CRUD 操作
- `schemartAIRouter` - AI 生成功能
- `schemartToolsRouter` - 工具功能（导入导出、SQL 生成）

#### HTTP 端点配置
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
    onError: ({ error, path }) => {
      console.error(`tRPC error on ${path}:`, error)
    },
  })

export { handler as GET, handler as POST }
```

### 核心业务路由设计

#### 项目管理路由
```typescript
// src/server/routers/schemart.ts
export const schemartRouter = router({
  // 获取所有项目
  getProjects: publicProcedure
    .query(async () => {
      const projects = await db
        .select({
          id: projectsTable.id,
          name: projectsTable.name,
          description: projectsTable.description,
          createdAt: projectsTable.createdAt,
          updatedAt: projectsTable.updatedAt,
          tableCount: sql<number>`count(${tablesTable.id})`.as('tableCount')
        })
        .from(projectsTable)
        .leftJoin(tablesTable, eq(projectsTable.id, tablesTable.projectId))
        .groupBy(projectsTable.id)
        .orderBy(desc(projectsTable.updatedAt))

      return projects
    }),

  // 创建项目
  createProject: publicProcedure
    .input(schemartInputSchema.createProject)
    .mutation(async ({ input }) => {
      const now = Math.floor(Date.now() / 1000)
      const newProject = await db.insert(projectsTable).values({
        name: input.name,
        description: input.description || null,
        createdAt: now,
        updatedAt: now,
      }).returning()

      return newProject[0]
    }),

  // 更新项目
  updateProject: publicProcedure
    .input(schemartInputSchema.updateProject)
    .mutation(async ({ input }) => {
      const now = Math.floor(Date.now() / 1000)
      const updatedProject = await db
        .update(projectsTable)
        .set({
          name: input.name,
          description: input.description,
          updatedAt: now,
        })
        .where(eq(projectsTable.id, input.id))
        .returning()

      return updatedProject[0]
    }),

  // 删除项目（级联删除）
  deleteProject: publicProcedure
    .input(schemartInputSchema.deleteProject)
    .mutation(async ({ input }) => {
      // 获取项目下的所有表
      const tables = await db
        .select()
        .from(tablesTable)
        .where(eq(tablesTable.projectId, input.id))

      // 级联删除相关数据
      for (const table of tables) {
        await db.delete(columnsTable).where(eq(columnsTable.tableId, table.id))
        await db.delete(indexesTable).where(eq(indexesTable.tableId, table.id))
        await db.delete(conversationHistoryTable)
          .where(eq(conversationHistoryTable.tableId, table.id))
        await db.delete(tableHistoryTable)
          .where(eq(tableHistoryTable.tableId, table.id))
      }

      // 删除表和项目
      await db.delete(tablesTable).where(eq(tablesTable.projectId, input.id))
      await db.delete(projectsTable).where(eq(projectsTable.id, input.id))

      return { success: true }
    })
})
```

#### 表管理路由
```typescript
// 创建表
createTable: publicProcedure
  .input(schemartInputSchema.createTable)
  .mutation(async ({ input }) => {
    const now = Math.floor(Date.now() / 1000)

    // 创建表记录
    const newTable = await db.insert(tablesTable).values({
      projectId: input.projectId,
      name: input.name,
      comment: input.comment || null,
      createdAt: now,
      updatedAt: now,
    }).returning()

    const tableId = newTable[0].id

    // 批量创建列
    if (input.columns && input.columns.length > 0) {
      const columnsData = input.columns.map((col, index) => ({
        tableId,
        name: col.name,
        type: col.type,
        comment: col.comment,
        isNullable: col.isNullable ? 1 : 0,
        isPrimaryKey: col.isPrimaryKey ? 1 : 0,
        isAutoIncrement: col.isAutoIncrement ? 1 : 0,
        isUnique: col.isUnique ? 1 : 0,
        defaultValue: col.defaultValue || null,
        isBasicField: col.isBasicField ? 1 : 0,
        orderIndex: col.orderIndex || index,
        createdAt: now,
        updatedAt: now,
      }))
      await db.insert(columnsTable).values(columnsData)
    }

    // 批量创建索引
    if (input.indexes && input.indexes.length > 0) {
      const indexesData = input.indexes.map((idx) => ({
        tableId,
        name: idx.name,
        columns: JSON.stringify(idx.columns),
        isUnique: idx.isUnique ? 1 : 0,
        comment: idx.comment || null,
        createdAt: now,
        updatedAt: now,
      }))
      await db.insert(indexesTable).values(indexesData)
    }

    return newTable[0]
  }),

// 更新表
updateTable: publicProcedure
  .input(schemartInputSchema.updateTable)
  .mutation(async ({ input }) => {
    const now = Math.floor(Date.now() / 1000)

    // 获取旧数据用于历史记录
    const oldColumns = await db
      .select()
      .from(columnsTable)
      .where(eq(columnsTable.tableId, input.id))
      .orderBy(columnsTable.orderIndex)

    const oldIndexes = await db
      .select()
      .from(indexesTable)
      .where(eq(indexesTable.tableId, input.id))

    // 更新表基本信息
    const updatedTable = await db
      .update(tablesTable)
      .set({
        name: input.name,
        comment: input.comment,
        updatedAt: now,
      })
      .where(eq(tablesTable.id, input.id))
      .returning()

    // 更新列定义（删除重建策略）
    if (input.columns) {
      await db.delete(columnsTable).where(eq(columnsTable.tableId, input.id))

      const columnsData = input.columns.map((col, index) => ({
        tableId: input.id,
        name: col.name,
        type: col.type,
        comment: col.comment,
        isNullable: col.isNullable ? 1 : 0,
        isPrimaryKey: col.isPrimaryKey ? 1 : 0,
        isAutoIncrement: col.isAutoIncrement ? 1 : 0,
        isUnique: col.isUnique ? 1 : 0,
        defaultValue: col.defaultValue || null,
        isBasicField: col.isBasicField ? 1 : 0,
        orderIndex: col.orderIndex || index,
        createdAt: now,
        updatedAt: now,
      }))
      await db.insert(columnsTable).values(columnsData)
    }

    // 更新索引定义
    if (input.indexes) {
      await db.delete(indexesTable).where(eq(indexesTable.tableId, input.id))

      const indexesData = input.indexes.map((idx) => ({
        tableId: input.id,
        name: idx.name,
        columns: JSON.stringify(idx.columns),
        isUnique: idx.isUnique ? 1 : 0,
        comment: idx.comment || null,
        createdAt: now,
        updatedAt: now,
      }))
      await db.insert(indexesTable).values(indexesData)
    }

    // 记录历史
    const snapshot = {
      table: updatedTable[0],
      columns: input.columns || oldColumns,
      indexes: input.indexes || oldIndexes,
    }

    await db.insert(tableHistoryTable).values({
      tableId: input.id,
      changeType: 'update',
      changeSummary: `更新表 ${updatedTable[0].name}`,
      sqlStatements: JSON.stringify([]),
      snapshot: JSON.stringify(snapshot),
      createdAt: now,
    })

    return updatedTable[0]
  })
```

### 数据验证系统

#### Zod Schema 定义
```typescript
// src/lib/schema/schemart.ts
export const schemartInputSchema = {
  // 项目相关
  createProject: z.object({
    name: z.string().min(1, '项目名称不能为空').max(100, '项目名称过长'),
    description: z.string().optional(),
  }),

  updateProject: z.object({
    id: z.string(),
    name: z.string().min(1, '项目名称不能为空').max(100, '项目名称过长'),
    description: z.string().optional(),
  }),

  deleteProject: z.object({
    id: z.string(),
  }),

  // 表相关
  createTable: z.object({
    projectId: z.string(),
    name: z.string().min(1, '表名不能为空').max(100, '表名过长'),
    comment: z.string().optional(),
    columns: z.array(z.object({
      name: z.string().min(1, '字段名不能为空'),
      type: z.string().min(1, '字段类型不能为空'),
      comment: z.string().min(1, '字段注释不能为空'),
      isNullable: z.boolean().default(false),
      isPrimaryKey: z.boolean().default(false),
      isAutoIncrement: z.boolean().default(false),
      isUnique: z.boolean().default(false),
      defaultValue: z.string().optional(),
      isBasicField: z.boolean().default(false),
      orderIndex: z.number().optional(),
    })).optional(),
    indexes: z.array(z.object({
      name: z.string().min(1, '索引名不能为空'),
      columns: z.array(z.string()).min(1, '索引列不能为空'),
      isUnique: z.boolean().default(false),
      comment: z.string().optional(),
    })).optional(),
  }),

  // AI 相关
  generateTable: z.object({
    projectId: z.string(),
    description: z.string().min(1, '描述不能为空'),
    provider: z.enum(['openai', 'claude', 'gemini']),
    model: z.string().optional(),
    contextTableIds: z.array(z.string()).optional(),
  })
}
```

### 错误处理机制

#### 统一错误处理
```typescript
import { TRPCError } from '@trpc/server'

// 业务逻辑错误
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: '项目名称不能为空',
})

// 数据库错误处理
try {
  const result = await db.insert(projectsTable).values(data).returning()
  return result[0]
} catch (error) {
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: '创建项目失败',
    cause: error,
  })
}

// 权限和验证错误
if (!isProviderAvailable(input.provider)) {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: `AI提供商 ${input.provider} 不可用，请检查API密钥配置`,
  })
}
```

#### 全局错误处理器
```typescript
// src/app/(server)/api/trpc/[trpc]/route.ts
const handler = (req: Request) =>
  fetchRequestHandler({
    onError: ({ error, path }) => {
      console.error(`tRPC error on ${path}:`, error)
      // 可以添加日志记录、错误上报等
    },
  })
```

### 客户端集成

#### tRPC 客户端配置
```typescript
// src/lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/routers/_app'

export const trpc = createTRPCReact<AppRouter>()

// React Query 集成配置
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
    }),
  ],
})
```

#### Provider 组件
```typescript
// src/components/providers/TrpcProvider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import superjson from 'superjson'
import { trpc } from '@/lib/trpc/client'

export const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1分钟
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

## 3. Relevant Code Modules

### tRPC 核心文件
- `src/server/routers/_app.ts` - 主路由聚合器
- `src/server/routers/schemart.ts` - 核心业务路由
- `src/server/routers/schemart-ai.ts` - AI 功能路由
- `src/server/routers/schemart-tools.ts` - 工具功能路由

### 客户端集成
- `src/lib/trpc/client.ts` - tRPC 客户端配置
- `src/components/providers/TrpcProvider.tsx` - React Query 集成
- `src/app/(server)/api/trpc/[trpc]/route.ts` - HTTP 端点

### 数据验证
- `src/lib/schema/schemart.ts` - Zod 验证 schema
- `src/server/trpc.ts` - tRPC 服务器配置
- `src/lib/utils/utils.ts` - 工具函数

## 4. Attention

- tRPC 路由修改后需要重新生成客户端类型，确保类型安全
- 数据库操作需要在事务中处理，确保数据一致性
- 错误信息要用户友好，避免暴露技术细节
- API 性能优化：批量操作、索引使用、查询优化
- 输入验证要严格，防止 SQL 注入和数据污染
- 布尔值字段在 SQLite 中使用整数存储，需要进行类型转换
- 复杂查询要考虑性能影响，避免 N+1 查询问题