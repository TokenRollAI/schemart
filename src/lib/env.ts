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
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  OPENAI_MODEL: z.string().default('gpt-4o-mini').optional(),

  // Google Gemini
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_API_BASE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  GOOGLE_MODEL: z.string().default('gemini-2.0-flash-001').optional(),

  // Anthropic Claude
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_BASE_URL: z
    .string()
    .url()
    .default('https://api.anthropic.com')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  ANTHROPIC_MODEL: z.string().default('claude-3-5-sonnet-latest').optional(),
})

/**
 * 验证并解析环境变量
 * 如果验证失败，会抛出详细的错误信息
 */
export const env = envSchema.parse(process.env)

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
