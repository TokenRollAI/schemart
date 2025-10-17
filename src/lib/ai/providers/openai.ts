// import { createOpenAI } from '@ai-sdk/openai'
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
