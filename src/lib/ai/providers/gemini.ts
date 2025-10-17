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
