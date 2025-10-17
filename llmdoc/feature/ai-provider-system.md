# AI 提供者系统设计

## 1. Purpose

Fast MVP 提供统一的 AI 提供商抽象层，支持 OpenAI、Claude (Anthropic) 和 Gemini (Google) 三大 AI 平台，通过工厂模式和策略模式设计，实现一致的 API 接口和灵活的配置管理。

## 2. How it Works

### 2.1 核心架构设计

**文件结构:**

```
src/lib/ai/
└── providers/
    ├── index.ts          # 核心工厂函数和类型定义
    ├── openai.ts         # OpenAI 提供者实现
    ├── claude.ts         # Claude (Anthropic) 提供者实现
    └── gemini.ts         # Gemini (Google) 提供者实现
```

**核心工厂函数:**

```typescript
// src/lib/ai/providers/index.ts
import type { LanguageModel } from 'ai'
import { getClaudeModel } from './claude'
import { getGeminiModel } from './gemini'
import { getOpenAIModel } from './openai'

export type AiProvider = 'gemini' | 'openai' | 'claude'

/**
 * Maps a provider identifier to the corresponding Vercel AI SDK language model.
 *
 * @param provider - The target provider identifier.
 * @param model - Optional override for the underlying model name.
 * @throws Error when the provider is not supported or its configuration is missing.
 */
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

**设计特点:**

- 提供统一的 API 入口点
- 支持可选的模型覆盖参数
- 返回标准的 Vercel AI SDK `LanguageModel` 类型
- 包含错误处理机制

### 2.2 提供者实现模式

**OpenAI 提供者:**

```typescript
// src/lib/ai/providers/openai.ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModel } from 'ai'
import { env } from '@/lib/env'

let client: ReturnType<typeof createOpenAICompatible> | null = null

const getClient = () => {
  if (!client) {
    if (!env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY is not set. Define it in your environment.',
      )
    }

    client = createOpenAICompatible({
      apiKey: env.OPENAI_API_KEY,
      name: 'openai',
      baseURL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    })
  }

  return client
}

/**
 * Returns an OpenAI-compatible language model ready for Vercel AI SDK utilities.
 *
 * @param model - Optional override for the model identifier. Falls back to OPENAI_MODEL or gpt-4o-mini.
 */
export const getOpenAIModel = (model?: string): LanguageModel => {
  const selectedModel = model || env.OPENAI_MODEL || 'gpt-4o-mini'
  return getClient()(selectedModel)
}
```

**Claude 提供者:**

```typescript
// src/lib/ai/providers/claude.ts
import { createAnthropic } from '@ai-sdk/anthropic'
import type { LanguageModel } from 'ai'
import { env } from '@/lib/env'

let client: ReturnType<typeof createAnthropic> | null = null

const getClient = () => {
  if (!client) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Define it in your environment.',
      )
    }

    client = createAnthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      baseURL: env.ANTHROPIC_BASE_URL || undefined,
    })
  }

  return client
}

/**
 * Returns a Claude language model for consumption through the Vercel AI SDK.
 *
 * @param model - Optional override for the model identifier. Falls back to ANTHROPIC_MODEL or claude-3-5-sonnet-latest.
 */
export const getClaudeModel = (model?: string): LanguageModel => {
  const selectedModel =
    model || env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'
  return getClient()(selectedModel)
}
```

**Gemini 提供者:**

```typescript
// src/lib/ai/providers/gemini.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LanguageModel } from 'ai'
import { env } from '@/lib/env'

let client: ReturnType<typeof createGoogleGenerativeAI> | null = null

const getClient = () => {
  if (!client) {
    if (!env.GOOGLE_API_KEY) {
      throw new Error(
        'GOOGLE_API_KEY is not set. Define it in your environment.',
      )
    }

    client = createGoogleGenerativeAI({
      apiKey: env.GOOGLE_API_KEY,
      baseURL: env.GOOGLE_API_BASE_URL || undefined,
    })
  }

  return client
}

/**
 * Returns a Gemini language model that can be consumed by the Vercel AI SDK utilities.
 *
 * @param model - Optional override for the model identifier. Falls back to GOOGLE_MODEL or gemini-2.0-flash-001.
 */
export const getGeminiModel = (model?: string): LanguageModel => {
  const selectedModel = model || env.GOOGLE_MODEL || 'gemini-2.0-flash-001'
  return getClient()(selectedModel)
}
```

### 2.3 配置管理系统

**环境变量验证:**

```typescript
// src/lib/env.ts
import { z } from 'zod'

/**
 * 环境变量验证 schema
 * 在应用启动时验证必需的环境变量
 */
const envSchema = z.object({
  // Database
  DB_FILE_NAME: z.string().default('file:local.db'),

  // Next.js
  PORT: z.string().default('3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z
    .string()
    .url()
    .default('https://api.openai.com/v1')
    .optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini').optional(),

  // Google Gemini
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_API_BASE_URL: z.string().url().optional(),
  GOOGLE_MODEL: z.string().default('gemini-2.0-flash-001').optional(),

  // Anthropic Claude
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_BASE_URL: z
    .string()
    .url()
    .default('https://api.anthropic.com')
    .optional(),
  ANTHROPIC_MODEL: z.string().default('claude-3-5-sonnet-latest').optional(),
})

/**
 * 验证并解析环境变量
 * 如果验证失败，会抛出详细的错误信息
 */
export const env = envSchema.parse(process.env)
```

**辅助函数:**

```typescript
/**
 * 检查至少有一个 AI provider 的 API key 已配置
 */
export const hasAnyAIProvider = () => {
  return !!(env.OPENAI_API_KEY || env.GOOGLE_API_KEY || env.ANTHROPIC_API_KEY)
}

/**
 * 获取已配置的 AI providers 列表
 */
export const getAvailableProviders = () => {
  const providers: string[] = []
  if (env.OPENAI_API_KEY) providers.push('openai')
  if (env.GOOGLE_API_KEY) providers.push('gemini')
  if (env.ANTHROPIC_API_KEY) providers.push('claude')
  return providers
}
```

### 2.4 实际应用案例

**tRPC 集成:**

```typescript
// src/server/routers/chat.ts
import { generateText } from 'ai'
import { TRPCError } from '@trpc/server'
import { publicProcedure, router } from '../trpc'
import { resolveLanguageModel } from '@/lib/ai/providers'
import { chatInputSchema } from '@/lib/schema/chat'
import type { AiProvider } from '@/lib/ai/providers'

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

**输入验证:**

```typescript
// src/lib/schema/chat.ts
import { z } from 'zod'

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

## 3. Relevant Code Modules

### 3.1 核心抽象层

- `src/lib/ai/providers/index.ts` - AI 提供商工厂函数和类型定义
- `src/lib/ai/providers/openai.ts` - OpenAI 提供者实现
- `src/lib/ai/providers/claude.ts` - Claude 提供者实现
- `src/lib/ai/providers/gemini.ts` - Gemini 提供者实现

### 3.2 配置管理

- `src/lib/env.ts` - 环境变量验证和类型定义
- `.env.example` - 环境变量配置模板

### 3.3 实际使用

- `src/server/routers/chat.ts` - AI 聊天功能的 tRPC 实现
- `src/lib/schema/chat.ts` - 聊天功能的输入验证
- `src/components/chat/OpenAIChatDemo.tsx` - 前端聊天组件

### 3.4 Vercel AI SDK 集成

- `ai` - 核心 SDK 包，提供 `LanguageModel` 类型
- `@ai-sdk/openai-compatible` - OpenAI 兼容 API 支持
- `@ai-sdk/anthropic` - Anthropic Claude 支持
- `@ai-sdk/google` - Google Gemini 支持

## 4. Attention

- **API Key 安全**: 绝不直接在代码中硬编码 API Key，必须使用环境变量
- **错误处理**: 需要针对不同类型的 API 错误进行分类处理，包含详细的错误分类逻辑
- **模型覆盖**: 支持运行时模型名称覆盖，但需要验证模型有效性
- **客户端单例**: 每个提供者使用单例模式，避免重复创建连接
- **配置验证**: 应用启动时验证必需的环境变量
- **扩展性**: 添加新提供者需要更新工厂函数和类型定义
- **OpenAI 特殊配置**: 使用 `createOpenAICompatible` 而非 `createOpenAI`，支持自定义 base URL
- **环境变量命名**: Gemini 使用 `GOOGLE_API_BASE_URL` 而非 `GOOGLE_BASE_URL`
