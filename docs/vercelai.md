# 在本项目中使用 Vercel AI SDK 的团队指南

本文档旨在为团队成员提供在当前项目中集成和使用 Vercel AI SDK 的清晰指引。

## 1. 技术选型与定位

在本项目中，我们集成了 `Vercel AI SDK` 以满足不同的 AI 功能需求。

它的核心优势在于：

- **简化的前端 Hook**: 提供了强大的 React Hook（如 `useChat`），自动处理消息状态、用户输入、加载状态和与后端的流式通信，极大简化了前端逻辑。
- **后端模型无关**：SDK 的后端部分可以与 OpenAI, Google, Anthropic, Hugging Face 等多种模型提供商无缝集成。
- **流式 UI 支持**：内置了对流式文本响应（Streaming Text Responses）的一流支持，可以轻松实现类似 ChatGPT 的打字机效果，提升用户体验。
- **边缘函数优化**：设计时就考虑了在 Vercel Edge Functions 等边缘计算环境中运行，以实现最低延迟。

## 3. 项目架构概览

在我们的项目中，一个典型的 Vercel AI SDK 应用包含两部分：

- **后端 API 端点**: `src/app/(server)/api/chat/route.ts`
  - 职责：处理来自前端的聊天请求。它接收消息历史，与指定的 AI 模型（如 Google Gemini）通信，并将模型的响应以流式方式返回给前端。
- **前端 UI 组件**： (待创建)
  - 职责：使用 `@ai-sdk/react` 提供的 `useChat` hook 来构建一个完整的聊天交互界面。

## 4. 后端配置 (`chat/route.ts`)

我们项目中已有一个配置好的后端端点，这是所有基于 Vercel AI SDK 的聊天功能的基础。

- **文件位置**: `src/app/(server)/api/chat/route.ts`
- **运行时**: `edge`，确保了最低的响应延迟。
- **核心逻辑**:
  1.  从请求体中解析出 `messages` 数组。
  2.  使用 `ai` 包中的 `streamText` 函数，将消息传递给 AI 模型。
  3.  我们当前配置的模型是 `google('gemini-2.0-flash-001')`。
  4.  将 `streamText` 返回的结果通过 `.toTextStreamResponse()` 转换为一个标准的流式响应。

```typescript
// src/app/(server)/api/chat/route.ts (当前实现)
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: google('gemini-2.0-flash-001'),
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    // ... 错误处理 ...
  }
}
```

## 5. 前端实现 (标准接入示例)

当前项目中尚未有直接使用 `useChat` 的前端组件。以下是一个标准的、可直接复用的示例组件，你可以将其作为新聊天功能的起点。

**步骤 1: 创建组件文件**

在 `src/components/chat/` 目录下创建一个新文件，例如 `VercelChat.tsx`。

**步骤 2: 编写组件代码**

```tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function VercelChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    // api 属性指向我们在后端创建的端点
    api: '/api/chat',
  })

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle>Vercel AI 聊天</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4 h-[400px] overflow-y-auto pr-4'>
          {messages.map((m) => (
            <div key={m.id} className='whitespace-pre-wrap'>
              <strong>{m.role === 'user' ? '你: ' : 'AI: '}</strong>
              {m.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className='flex items-center gap-2 pt-4'>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder='说点什么...'
          />
          <Button type='submit'>发送</Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### `useChat` Hook 解析

- `messages`: 一个包含所有聊天记录的数组 (`{id, role, content}`), hook 会自动管理它。
- `input`: 当前输入框内容的受控状态。
- `handleInputChange`: 用于更新 `input` 状态的 `onChange`处理器。
- `handleSubmit`: 用于处理表单提交的处理器。它会自动将当前的用户消息添加到 `messages` 数组，并发送请求到后端。
- `api`: (可选，默认为 `/api/chat`) 指定后端 API 端点的路径。

## 6. 官方文档

Vercel AI SDK 功能非常丰富，包括工具调用 (Tool Calling)、对象生成 (Object Generation) 等高级功能。要深入了解，请查阅官方文档。

- **官方文档地址**: [https://sdk.vercel.ai/docs](https://sdk.vercel.ai/docs)
- **`useChat` Hook 文档**: [https://sdk.vercel.ai/docs/api-reference/use-chat](https://sdk.vercel.ai/docs/api-reference/use-chat)

---

这份指南提供了一个完整的、基于当前项目的 Vercel AI SDK 集成方案。团队成员可以以此为基础，快速构建新的 AI 聊天功能。
