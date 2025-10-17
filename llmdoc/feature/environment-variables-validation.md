# 环境变量验证系统

## 1. Purpose

详细说明 Fast MVP 项目中环境变量验证系统的设计和实现，特别是针对 URL 类型环境变量的 Zod 验证修复。

## 2. How it Works / Step-by-Step Guide

### 环境变量验证架构

项目使用 Zod 进行环境变量的类型安全验证，确保在应用启动时所有必需的环境变量都正确配置。

### 核心验证逻辑

**验证配置文件**: `src/lib/env.ts`

```typescript
import { z } from 'zod'

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
```

### Zod 4.x URL 验证修复

**问题描述**:
- Zod 4.x 的 `.url()` 验证器不接受空字符串
- 当用户不使用某个 AI 提供商时，留空的 BASE_URL 环境变量会导致验证失败

**修复方案**:
```typescript
// 修复前 (Zod 3.x 可用，4.x 失败)
OPENAI_BASE_URL: z.string().url().optional()

// 修复后 (兼容 Zod 4.x)
OPENAI_BASE_URL: z
  .string()
  .url()
  .default('https://api.openai.com/v1')
  .optional()
  .or(z.literal(''))                    // 允许空字符串
  .transform((val) => (val === '' ? undefined : val))  // 转换为 undefined
```

**修复原理**:
1. `.or(z.literal(''))` - 允许空字符串作为有效值
2. `.transform((val) => (val === '' ? undefined : val))` - 将空字符串转换为 undefined
3. 系统随后会使用 `.default()` 中定义的默认值

### 辅助验证函数

**检查 AI 提供商配置**:
```typescript
export const hasAnyAIProvider = () => {
  return !!(env.OPENAI_API_KEY || env.GOOGLE_API_KEY || env.ANTHROPIC_API_KEY)
}
```

**获取可用提供商列表**:
```typescript
export const getAvailableProviders = () => {
  const providers: string[] = []
  if (env.OPENAI_API_KEY) providers.push('openai')
  if (env.GOOGLE_API_KEY) providers.push('gemini')
  if (env.ANTHROPIC_API_KEY) providers.push('claude')
  return providers
}
```

### 环境变量文件结构

**`.env.example` 模板**:
```bash
# Local development database (SQLite via libSQL/Turso)
DB_FILE_NAME=file:local.db

# Next.js dev server port override
PORT=3000

# --- Vercel AI SDK Providers ---
# OpenAI configuration
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Google Gemini configuration
GOOGLE_API_KEY=
GOOGLE_API_BASE_URL=
GOOGLE_MODEL=gemini-2.0-flash-001

# Anthropic Claude configuration
ANTHROPIC_API_KEY=
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

### 验证流程

1. **应用启动时验证**: `envSchema.parse(process.env)`
2. **错误处理**: 如果验证失败，应用会立即启动并显示详细错误信息
3. **类型安全**: 所有环境变量通过 TypeScript 类型检查
4. **默认值处理**: 空值自动使用预定义的默认值

## 3. Relevant Code Modules

### 3.1 核心验证模块

- `src/lib/env.ts` - 环境变量验证逻辑和辅助函数
- `.env.example` - 环境变量配置模板

### 3.2 使用环境变量的模块

- `src/lib/ai/providers/` - AI 提供商配置读取
- `src/db/db.ts` - 数据库连接配置
- `drizzle.config.ts` - Drizzle ORM 配置

### 3.3 相关配置

- `package.json` - 依赖版本 (Zod 4.1.12)
- `next.config.js` - Next.js 环境变量处理

## 4. Attention

- **Zod 版本兼容性**: 当前使用 Zod 4.1.12，URL 验证行为与 3.x 不同
- **空字符串处理**: URL 类型环境变量可以留空，系统会自动使用默认值
- **类型安全**: 所有环境变量访问都通过 TypeScript 类型检查
- **开发体验**: 验证失败时会显示清晰的错误信息，便于调试
- **生产安全**: 敏感信息（API Keys）不会出现在错误日志中
- **默认值策略**: 每个可选环境变量都有合理的默认值
- **验证时机**: 应用启动时立即验证，避免运行时错误