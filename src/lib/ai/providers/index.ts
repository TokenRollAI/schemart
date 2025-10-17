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
