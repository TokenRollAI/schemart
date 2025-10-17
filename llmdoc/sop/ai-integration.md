# AI 功能集成流程

## 1. Purpose

标准化 AI 功能的集成流程，包括添加新的 AI 提供商、实现 AI 驱动的功能模块，确保代码一致性和类型安全。

## 2. How it Works / Step-by-Step Guide

### 步骤 1: 配置 AI 提供商 (5 分钟)

**使用现有提供商 (OpenAI/Claude/Gemini):**

```bash
# .env.local
# 选择一个或多个提供商配置

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"
OPENAI_BASE_URL="https://api.openai.com/v1"  # 可选，可留空使用默认值

# Claude
ANTHROPIC_API_KEY="sk-ant-your-claude-api-key"
ANTHROPIC_MODEL="claude-3-5-sonnet-latest"
ANTHROPIC_BASE_URL="https://api.anthropic.com"  # 可选，可留空使用默认值

# Gemini
GOOGLE_API_KEY="your-google-api-key"
GOOGLE_MODEL="gemini-2.0-flash-001"
GOOGLE_API_BASE_URL=""  # 可留空，系统会自动处理
```

**环境变量已预配置在 `.env.example` 中，复制并填入实际值即可。**

**环境变量验证说明:**
- URL 类型环境变量（`*_BASE_URL`）支持空字符串，系统会自动使用对应的默认值
- 如果不使用某个提供商，可以将其所有环境变量留空
- 系统在启动时会自动验证环境变量格式，空字符串不会导致 Zod 验证失败

### 步骤 2: 添加新的 AI 提供商 (15 分钟)

**仅在需要支持新提供商时执行此步骤**

1. **创建提供商实现文件**

   ```typescript
   // src/lib/ai/providers/new-provider.ts
   import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
   import type { LanguageModel } from 'ai'
   import { env } from '@/lib/env'

   let client: ReturnType<typeof createOpenAICompatible> | null = null

   const getClient = () => {
     if (!client) {
       if (!env.NEW_PROVIDER_API_KEY) {
         throw new Error(
           'NEW_PROVIDER_API_KEY is not set. Define it in your environment.',
         )
       }

       client = createOpenAICompatible({
         apiKey: env.NEW_PROVIDER_API_KEY,
         name: 'new-provider',
         baseURL:
           env.NEW_PROVIDER_BASE_URL || 'https://api.new-provider.com/v1',
       })
     }
     return client
   }

   export const getNewProviderModel = (model?: string): LanguageModel => {
     const selectedModel = model || env.NEW_PROVIDER_MODEL || 'default-model'
     return getClient()(selectedModel)
   }
   ```

2. **更新工厂函数**

   ```typescript
   // src/lib/ai/providers/index.ts
   import { getNewProviderModel } from './new-provider'

   export type AiProvider = 'gemini' | 'openai' | 'claude' | 'newProvider'

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
       case 'newProvider':
         return getNewProviderModel(model)
       default:
         throw new Error(`Unsupported AI provider: ${provider}`)
     }
   }
   ```

3. **更新环境变量配置**

   ```typescript
   // src/lib/env.ts
   const envSchema = z.object({
     // ... 现有配置
     NEW_PROVIDER_API_KEY: z.string().optional(),
     NEW_PROVIDER_BASE_URL: z.string().url().optional(),
     NEW_PROVIDER_MODEL: z.string().default('default-model').optional(),
   })
   ```

4. **更新验证 schema**
   ```typescript
   // src/lib/schema/chat.ts
   export const chatInputSchema = {
     sendMessage: z.object({
       message: z.string().min(1, '消息不能为空'),
       provider: z
         .enum(['openai', 'claude', 'gemini', 'newProvider'])
         .default('openai'),
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

### 步骤 3: 实现 AI 聊天功能 (10 分钟)

**创建新的 tRPC 路由** (`src/server/routers/ai-feature.ts`):

```typescript
import { router, publicProcedure } from '../trpc'
import { generateText } from 'ai'
import { resolveLanguageModel } from '@/lib/ai/providers'
import { chatInputSchema } from '@/lib/schema/chat'
import type { AiProvider } from '@/lib/ai/providers'

export const aiFeatureRouter = router({
  // 简单文本生成
  generate: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1, '提示不能为空'),
        provider: z.enum(['openai', 'claude', 'gemini']).default('openai'),
        model: z.string().optional(),
        temperature: z.number().min(0).max(2).default(0.7),
      }),
    )
    .mutation(async ({ input }) => {
      const languageModel = resolveLanguageModel(
        input.provider as AiProvider,
        input.model,
      )
      const result = await generateText({
        model: languageModel,
        prompt: input.prompt,
        temperature: input.temperature,
      })
      return { success: true, text: result.text, usage: result.usage }
    }),

  // 对话功能 (复制现有 chat router 实现)
  sendMessage: publicProcedure
    .input(chatInputSchema.sendMessage)
    .mutation(async ({ input }) => {
      // 复制 src/server/routers/chat.ts 的完整实现
      // 包括消息构建、错误处理等所有逻辑
    }),
})
```

**注册路由** (`src/server/routers/_app.ts`):

```typescript
import { aiFeatureRouter } from './ai-feature'
export const appRouter = router({
  chat: chatRouter,
  aiFeature: aiFeatureRouter, // 添加新路由
})
```

**关键要求**:

- 使用 `resolveLanguageModel(provider, model)` 获取模型
- 复制 `src/server/routers/chat.ts` 中的完整错误处理逻辑
- 错误处理包含详细日志和分类错误响应

### 步骤 4: 实现前端聊天组件 (15 分钟)

**使用 tRPC React Query hooks:**

```typescript
// src/components/aiFeature/AIChatDemo.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc/client'

export function AIChatDemo() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
  }>>([])

  const chatMutation = trpc.aiFeature.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
      }])
      setInput('')
    },
    onError: (error) => {
      console.error('聊天失败:', error)
    },
  })

  const handleSend = () => {
    if (!input.trim()) return

    // 添加用户消息
    setMessages(prev => [...prev, {
      role: 'user',
      content: input,
    }])

    // 发送到服务端
    chatMutation.mutate({
      message: input,
      provider: 'openai',
      conversationHistory: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Chat Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 消息列表 */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary/10 text-primary ml-8'
                  : 'bg-secondary/10 text-secondary-foreground mr-8'
              }`}
            >
              <div className="font-semibold mb-1">
                {message.role === 'user' ? '你' : 'AI'}
              </div>
              <div>{message.content}</div>
            </div>
          ))}
        </div>

        {/* 输入区域 */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入消息..."
            disabled={chatMutation.isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={chatMutation.isLoading || !input.trim()}
          >
            {chatMutation.isLoading ? '发送中...' : '发送'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 步骤 5: 实现流式响应 (可选，10 分钟)

**注意**: 当前项目使用 tRPC 进行 API 调用，流式响应需要通过 Route Handler 实现。

**服务端 Route Handler** (`src/app/api/ai/stream/route.ts`):

```typescript
import { streamText } from 'ai'
import { resolveLanguageModel } from '@/lib/ai/providers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { message, provider, model, conversationHistory } = await request.json()
  const languageModel = resolveLanguageModel(provider, model)

  const stream = await streamText({
    model: languageModel,
    messages: [
      ...conversationHistory,
      { role: 'user' as const, content: message },
    ],
    temperature: 0.7,
  })

  return stream.toDataStreamResponse()
}
```

**前端流式接收** - 使用 `useChat` hook，API 端点设为 `/api/ai/stream`

### 步骤 6: 错误处理模式

**使用与 chat router 相同的详细错误处理:**

- 详细错误日志记录 (provider, model, error, stack)
- API Key/认证错误 → UNAUTHORIZED
- 速率限制 → TOO_MANY_REQUESTS
- 模型不存在 → BAD_REQUEST
- 网络错误 → INTERNAL_SERVER_ERROR
- 通用错误带具体错误信息

**参考**: `src/server/routers/chat.ts` 中的完整错误处理实现

## 3. Relevant Code Modules

### 3.1 AI 提供商抽象层

- `src/lib/ai/providers/index.ts` - 工厂函数 resolveLanguageModel 和 AiProvider 类型定义
- `src/lib/ai/providers/openai.ts` - OpenAI 兼容实现 (使用 createOpenAICompatible)
- `src/lib/ai/providers/claude.ts` - Anthropic Claude 实现 (使用 createAnthropic)
- `src/lib/ai/providers/gemini.ts` - Google Gemini 实现 (使用 createGoogleGenerativeAI)

### 3.2 服务端路由

- `src/server/routers/chat.ts` - 现有 AI 聊天路由实现，包含完整的错误处理逻辑
- `src/server/routers/_app.ts` - 主路由聚合器，需要注册新的 AI 路由

### 3.3 前端组件

- 查看现有组件实现模式，使用 tRPC React Query hooks 进行 API 调用

### 3.4 配置和验证

- `src/lib/env.ts` - 环境变量配置，包含 hasAnyAIProvider 和 getAvailableProviders 辅助函数
- `src/lib/schema/chat.ts` - 输入验证 schema，包含 sendMessage 的完整定义
- `.env.example` - 环境变量模板文件

### 3.5 实际实现示例

- 参考 `src/server/routers/chat.ts` 中的 sendMessage 实现作为标准模板
- 所有 AI 功能都应使用 resolveLanguageModel(provider, model) 统一接口
- 错误处理应遵循现有模式，包含详细的日志记录和用户友好的错误信息

## 4. Attention

- **API Key 安全**: 绝不在代码中硬编码 API Key，必须使用环境变量
- **错误处理**: 必须使用与现有 chat router 相同的详细错误处理模式，包含错误日志和用户友好提示
- **模型覆盖**: 支持运行时模型名称覆盖，使用 resolveLanguageModel 的第二个参数
- **流式响应**: 对于长文本生成，需要通过 Route Handler 实现流式响应，tRPC 不支持流式
- **成本控制**: 使用 temperature、max_tokens 等参数控制 API 成本
- **提供商选择**: 根据任务类型选择合适的 AI 提供商，可使用 getAvailableProviders() 检查配置
- **类型安全**: 确保所有 AI 相关操作都保持类型安全，使用 AiProvider 类型和 resolveLanguageModel 函数
- **环境变量**: 新提供商需要同时在 .env.example、src/lib/env.ts 和 provider 实现文件中配置
- **URL 环境变量验证**: 系统已修复 Zod 4.x 验证问题，URL 类型环境变量现在支持空字符串，会自动转换为 undefined 并使用默认值
