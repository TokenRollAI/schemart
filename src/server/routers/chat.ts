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
