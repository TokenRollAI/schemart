# 服务端架构设计

## 1. Purpose

Fast MVP 服务端采用 tRPC + Zod + Drizzle ORM 架构，提供端到端类型安全、运行时数据验证和类型安全的数据库操作，实现现代化的全栈应用开发体验。

## 2. How it Works

### 2.1 tRPC 路由组织结构

**核心文件架构:**

```
src/server/
├── trpc.ts                    # tRPC 核心配置和初始化
└── routers/
    ├── _app.ts               # 主路由聚合器
    ├── hello.ts              # Hello 功能路由
    └── chat.ts               # AI 聊天功能路由
```

**主路由聚合器:**

```typescript
// src/server/routers/_app.ts
import { router } from '../trpc'
import { helloRouter } from './hello'
import { chatRouter } from './chat'

export const appRouter = router({
  hello: helloRouter,
  chat: chatRouter,
})

export type AppRouter = typeof appRouter
```

**组织特点:**

- 模块化设计：每个功能领域独立路由文件
- 统一聚合：通过 `_app.ts` 合并所有子路由
- 类型导出：为客户端提供完整的类型定义

### 2.2 tRPC 核心配置

**初始化配置:**

```typescript
// src/server/trpc.ts
const t = initTRPC.create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure
```

**关键特性:**

- **Superjson 序列化**: 支持 Date、Map、Set 等复杂类型
- **Zod 错误格式化**: 自动处理验证错误的详细格式化
- **统一的 Procedure 导出**: `publicProcedure` 和 `router` 工厂函数

### 2.3 功能路由实现模式

**Hello Router - CRUD 操作模式:**

```typescript
// src/server/routers/hello.ts
export const helloRouter = router({
  sayHello: publicProcedure
    .input(helloInputSchema.sayHello)
    .mutation(async ({ input }) => {
      const { name } = input

      const existingRecord = await db
        .select()
        .from(helloTable)
        .where(eq(helloTable.name, name))
        .limit(1)

      if (existingRecord.length > 0) {
        // 更新count
        const updatedRecord = await db
          .update(helloTable)
          .set({ count: existingRecord[0].count + 1 })
          .where(eq(helloTable.name, name))
          .returning()

        return {
          ...updatedRecord[0],
          message: `Hello ${name}! Count updated to ${updatedRecord[0].count}`,
        }
      } else {
        // 创建新记录
        const newRecord = await db
          .insert(helloTable)
          .values({ name, count: 1 })
          .returning()

        return {
          ...newRecord[0],
          message: `Hello ${name}! First time greeting, count is now 1`,
        }
      }
    }),

  getCount: publicProcedure
    .input(helloInputSchema.getCount)
    .query(async ({ input }) => {
      const { name } = input
      const record = await db
        .select()
        .from(helloTable)
        .where(eq(helloTable.name, name))
        .limit(1)

      if (record.length === 0) {
        return {
          id: null,
          name,
          count: 0,
          message: `No greetings found for ${name}`,
        }
      }

      return {
        ...record[0],
        message: `${name} has been greeted ${record[0].count} times`,
      }
    }),

  getAll: publicProcedure.query(async () => {
    const records = await db.select().from(helloTable)
    return records
  }),
})
```

**Chat Router - AI 集成模式:**

```typescript
// src/server/routers/chat.ts
export const chatRouter = router({
  sendMessage: publicProcedure
    .input(chatInputSchema.sendMessage)
    .mutation(async ({ input }) => {
      const { message, provider, model, conversationHistory } = input

      try {
        // 构建完整的消息历史
        const messages = [
          ...conversationHistory,
          {
            role: 'user' as const,
            content: message,
          },
        ]

        // 获取 AI 模型
        const languageModel = resolveLanguageModel(
          provider as AiProvider,
          model,
        )

        // 生成回复
        const result = await generateText({
          model: languageModel,
          messages,
          temperature: 0.7,
        })

        return {
          success: true,
          response: result.text,
          usage: result.usage,
        }
      } catch (error) {
        // 详细的错误日志
        console.error('Chat generation failed:', {
          provider,
          model,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })

        // 区分不同类型的错误
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase()

          // API Key 错误
          if (
            errorMessage.includes('api key') ||
            errorMessage.includes('authentication') ||
            errorMessage.includes('unauthorized') ||
            errorMessage.includes('is not set')
          ) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: `API key 未配置或无效 (${provider})。请检查环境变量配置。`,
              cause: error,
            })
          }

          // 速率限制
          if (
            errorMessage.includes('rate limit') ||
            errorMessage.includes('too many requests') ||
            errorMessage.includes('quota')
          ) {
            throw new TRPCError({
              code: 'TOO_MANY_REQUESTS',
              message: '请求过于频繁，请稍后再试。',
              cause: error,
            })
          }

          // 模型不支持
          if (
            errorMessage.includes('model') &&
            (errorMessage.includes('not found') ||
              errorMessage.includes('does not exist'))
          ) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `模型 "${model || 'default'}" 不存在或不支持。`,
              cause: error,
            })
          }

          // 网络错误
          if (
            errorMessage.includes('network') ||
            errorMessage.includes('fetch') ||
            errorMessage.includes('econnrefused')
          ) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: '网络连接失败，请检查网络或 API 端点配置。',
              cause: error,
            })
          }
        }

        // 通用错误
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? `生成回复失败: ${error.message}`
              : '生成回复时发生未知错误',
          cause: error,
        })
      }
    }),
})
```

### 2.4 数据验证和错误处理

**Zod Schema 验证:**

```typescript
// src/lib/schema/hello.ts
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

// src/lib/schema/chat.ts
export const chatInputSchema = {
  sendMessage: z.object({
    message: z.string().min(1, '消息不能为空'),
    provider: z.enum(['openai', 'claude', 'gemini']).default('openai'),
    model: z.string().optional(),
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
        }),
      )
      .default([]),
  }),
}
```

**分层错误处理:**

- **tRPC 错误格式化**: 自动检测 Zod 错误并格式化
- **业务逻辑错误分类**: 使用标准化的错误代码（UNAUTHORIZED、TOO_MANY_REQUESTS、BAD_REQUEST、INTERNAL_SERVER_ERROR）
- **中文错误消息**: 用户友好的本地化错误提示
- **错误原因保留**: 通过 `cause` 字段保留原始错误
- **详细错误日志**: Chat 路由包含完整的错误日志记录

### 2.5 数据库连接管理

**数据库连接单例模式:**

```typescript
// src/db/db.ts
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { helloTable } from './schema/hello'
import { env } from '@/lib/env'

let _db: LibSQLDatabase | null = null

export const getDb = (): LibSQLDatabase => {
  if (!_db) {
    _db = drizzle({
      connection: {
        url: env.DB_FILE_NAME,
      },
    })
  }
  return _db
}

export const db = getDb()
export { helloTable }
```

**数据表结构:**

```typescript
// src/db/schema/hello.ts
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const helloTable = sqliteTable('hello', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  count: int().notNull().default(0),
})
```

**AI 提供商解析:**

```typescript
// src/lib/ai/providers/index.ts
export type AiProvider = 'gemini' | 'openai' | 'claude'

export const resolveLanguageModel = (
  provider: AiProvider,
  model?: string,
): LanguageModel => {
  switch (provider) {
    case 'gemini':
      return getGeminiModel(model)
    case 'openai':
      return getOpenAIModel(model)
    case 'claude':
      return getClaudeModel(model)
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}
```

## 3. Relevant Code Modules

### 3.1 tRPC 核心配置

- `src/server/trpc.ts` - tRPC 初始化配置和错误格式化
- `src/server/routers/_app.ts` - 主路由聚合器和类型导出

### 3.2 业务路由

- `src/server/routers/hello.ts` - CRUD 操作示例路由，包含 sayHello、getCount、getAll 三个 procedures
- `src/server/routers/chat.ts` - AI 聊天功能路由，支持多提供商和详细错误处理

### 3.3 数据验证

- `src/lib/schema/hello.ts` - Hello 功能输入验证和类型导出
- `src/lib/schema/chat.ts` - Chat 功能输入验证

### 3.4 数据库交互

- `src/db/db.ts` - 数据库连接单例管理
- `src/db/schema/hello.ts` - Hello 表结构定义

### 3.5 AI 集成

- `src/lib/ai/providers/index.ts` - AI 提供商工厂函数和类型定义
- `src/lib/ai/providers/` - 具体提供商实现（openai、claude、gemini）

## 4. Attention

- **当前无认证机制**: 所有 procedures 都是公开的，生产环境需要添加认证中间件
- **数据库连接**: 使用单例模式但在高并发场景下可能需要连接池优化
- **错误处理**: Chat 路由包含详细的错误分类和日志记录，但可考虑添加结构化日志系统
- **AI 配置**: 依赖环境变量，缺少运行时配置验证
- **Procedure 返回值**: Hello 路由返回完整的记录对象而非简单的成功消息
- **查询优化**: 使用 `.limit(1)` 限制查询结果数量，提高性能
- **类型导出**: Schema 文件包含 TypeScript 类型导出，提供更好的类型安全
