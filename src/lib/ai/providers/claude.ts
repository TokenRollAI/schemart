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
