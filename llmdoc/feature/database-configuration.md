# 数据库与配置系统设计

## 1. Purpose

Fast MVP 采用 Drizzle ORM + SQLite (libSQL) 架构，结合 Zod 验证和环境变量管理，提供类型安全的数据库操作、灵活的配置管理和完整的开发工具链支持。

## 2. How it Works

### 2.1 数据库架构设计

**数据库连接管理:**

```typescript
// src/db/db.ts
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { helloTable } from './schema/hello'
import { env } from '@/lib/env'

/**
 * 数据库连接单例
 * 确保整个应用只创建一个数据库连接实例
 */
let _db: LibSQLDatabase | null = null

export const getDb = (): LibSQLDatabase => {
  if (!_db) {
    _db = drizzle({
      connection: {
        url: env.DB_FILE_NAME,
      },
    })
  }
  return _db
}

/**
 * @deprecated 使用 getDb() 替代直接导入 db
 * 为了向后兼容保留此导出，但建议使用函数形式
 */
export const db = getDb()

export { helloTable }
```

**设计特点:**

- **单例模式**: 确保数据库连接复用，避免重复创建
- **环境变量集成**: 通过 env 模块管理数据库配置
- **类型安全**: Drizzle ORM 提供完整的 TypeScript 支持
- **向后兼容**: 保留直接导出方式，便于现有代码迁移
- **直接导入表结构**: 从 schema 文件直接导出表定义

### 2.2 数据表结构设计

**Hello 表示例:**

```typescript
// src/db/schema/hello.ts
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const helloTable = sqliteTable('hello', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  count: int().notNull().default(0),
})
```

**表设计特点:**

- **简洁导入**: 使用 `int` 替代 `integer`
- **默认值设置**: count 字段默认值为 0
- **类型安全**: 通过 Drizzle 类型系统自动推断
- **约束定义**: 明确定义主键、唯一性约束等

### 2.3 Drizzle ORM 配置

**配置文件:**

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/db.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME || 'file:local.db',
  },
})
```

**数据库脚本 (package.json):**

```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 2.4 Zod 验证系统

**Schema 验证模式:**

```typescript
// src/lib/schema/hello.ts
import { z } from 'zod'

export const helloInputSchema = {
  sayHello: z.object({
    name: z.string().min(1, 'Name is required'),
  }),

  getCount: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
}

export type SayHelloInput = z.infer<typeof helloInputSchema.sayHello>
export type GetCountInput = z.infer<typeof helloInputSchema.getCount>

// src/lib/schema/chat.ts
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
```

**验证特点:**

- **强类型输入**: 每个 procedure 都有对应的 Zod schema
- **类型推断**: 自动生成 TypeScript 类型
- **中文错误消息**: 本地化的验证错误提示
- **默认值支持**: 合理的默认参数配置
- **复杂类型验证**: 支持嵌套对象和数组验证

### 2.5 环境变量管理

**环境变量验证:**

```typescript
// src/lib/env.ts
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
    .optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini').optional(),

  // Google Gemini
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_API_BASE_URL: z.string().url().optional(),
  GOOGLE_MODEL: z.string().default('gemini-2.0-flash-001').optional(),

  // Anthropic Claude
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_BASE_URL: z
    .string()
    .url()
    .default('https://api.anthropic.com')
    .optional(),
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
```

**环境变量模板 (.env.example):**

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

### 2.6 项目配置文件

**Next.js 配置:**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
```

**Tailwind CSS 配置:**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  // 启用 JIT 引擎（实现 Tree Shaking）和定义扫描路
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  prefix: '',
  // 定义主题
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('tailwindcss-animate'),
  ],
} satisfies Config

export default config
```

**PostCSS 配置:**

```javascript
// postcss.config.mjs
const config = {
  plugins: ['@tailwindcss/postcss'],
}

export default config
```

**ESLint 配置:**

```javascript
// eslint.config.mjs
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  eslintPluginPrettierRecommended,
]

export default eslintConfig
```

## 3. Relevant Code Modules

### 3.1 数据库层

- `src/db/db.ts` - 数据库连接管理和单例模式实现
- `src/db/schema/hello.ts` - 数据表结构定义
- `drizzle.config.ts` - Drizzle ORM 配置

### 3.2 验证系统

- `src/lib/schema/hello.ts` - Hello 功能验证模式和类型推断
- `src/lib/schema/chat.ts` - Chat 功能验证模式
- `src/lib/env.ts` - 环境变量验证和 AI Provider 检测

### 3.3 配置文件

- `package.json` - 项目依赖和脚本配置
- `next.config.ts` - Next.js 配置
- `tailwind.config.ts` - Tailwind CSS 配置
- `postcss.config.mjs` - PostCSS 配置
- `eslint.config.mjs` - ESLint 配置

### 3.4 环境配置

- `.env.example` - 环境变量模板
- `src/lib/env.ts` - 环境变量解析和验证

## 4. Attention

- **数据库模式**: 使用文件模式 (`file:local.db`)，适合开发和单机部署
- **环境变量验证**: 应用启动时进行，缺失必要配置会立即报错
- **Tailwind CSS v4**: 使用新的 PostCSS 插件配置方式 (`@tailwindcss/postcss`)
- **AI Provider 配置**: 所有配置都是可选的，至少需要一个才能正常使用聊天功能
- **数据库迁移**: 生产环境需要确认后执行 `pnpm db:generate` 和 `pnpm db:migrate`
- **类型安全**: 通过 TypeScript 和 Zod 实现编译时和运行时的双重类型保障
- **单例模式**: 数据库连接使用单例模式，确保连接复用
- **环境变量工具**: 提供检测和获取可用 AI Providers 的工具函数
