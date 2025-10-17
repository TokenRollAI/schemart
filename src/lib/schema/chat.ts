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
