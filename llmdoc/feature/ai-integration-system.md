# AI 集成系统

## 1. Purpose

详细描述 Schemart 项目的 AI 集成架构，包含多提供商抽象层、提示词工程、上下文管理和结果解析机制，为 AI 功能开发和扩展提供技术参考。

## 2. How it Works

### AI 提供商架构设计

项目采用统一的 AI 提供商抽象层，支持 OpenAI、Claude、Gemini 三大主流 AI 服务提供商，通过工厂模式实现动态模型选择和配置管理。

**核心架构模式：**
```typescript
// AI 提供商类型定义
export type AiProvider = 'gemini' | 'openai' | 'claude'

// 统一的模型接口
export const resolveLanguageModel = (
  provider: AiProvider,
  model?: string,
): LanguageModel => {
  switch (provider) {
    case 'openai': return getOpenAIModel(model)
    case 'claude': return getClaudeModel(model)
    case 'gemini': return getGeminiModel(model)
    default: throw new Error(`Unsupported AI provider: ${provider}`)
  }
}
```

### 提供商实现详情

#### OpenAI 集成
```typescript
export const getOpenAIModel = (model?: string): LanguageModel => {
  const selectedModel = model || 'gpt-4o-mini'
  return openai(selectedModel)
}
```

**支持的模型：**
- `gpt-4o-mini` (默认) - 轻量级多模态模型
- `gpt-4o` - 高性能多模态模型

#### Claude 集成
```typescript
export const getClaudeModel = (model?: string): LanguageModel => {
  const selectedModel = model || 'claude-3-5-sonnet-latest'
  return anthropic(selectedModel)
}
```

**支持的模型：**
- `claude-3-5-sonnet-latest` (默认) - 最新版 Claude 3.5 Sonnet

#### Gemini 集成
```typescript
export const getGeminiModel = (model?: string): LanguageModel => {
  const selectedModel = model || 'gemini-2.0-flash-001'
  return google(selectedModel)
}
```

**支持的模型：**
- `gemini-2.0-flash-001` (默认) - Gemini 2.0 Flash 模型

### 环境配置系统

#### 环境变量定义
```typescript
const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

#### 提供商可用性检查
```typescript
export const isProviderAvailable = (provider: AiProvider): boolean => {
  switch (provider) {
    case 'openai': return !!env.OPENAI_API_KEY
    case 'claude': return !!env.ANTHROPIC_API_KEY
    case 'gemini': return !!env.GOOGLE_API_KEY
    default: return false
  }
}
```

### 提示词工程系统

#### PostgreSQL 专用提示词
```typescript
const prompt = `你是一个PostgreSQL数据库设计专家。请根据用户的描述生成PostgreSQL数据库表结构设计。

用户描述: ${input.description}${contextTablesInfo}

要求:
1. 每个表必须包含基本字段: id (主键, 自增), created_at (创建时间), updated_at (更新时间)
2. 每一列都必须要有详细的中文注释
3. 字段类型设计注意事项:
   - 尽量使用 TEXT 类型替代 VARCHAR，除非有明确的长度限制需求
   - 灵活使用 JSONB 类型存储结构化但可能变化的数据
   - 使用 PostgreSQL 特有类型: UUID, JSONB, ARRAY, INET 等
   - 时间类型使用 TIMESTAMPTZ (带时区的时间戳)
4. 为常用查询字段添加索引
5. 根据需要添加唯一索引
6. 对于JSONB字段，可以考虑添加GIN索引以提升查询性能

输出格式:
请返回一个JSON数组，每个元素代表一个表，包含以下结构:
{
  "tableName": "表名",
  "tableComment": "表注释",
  "columns": [
    {
      "name": "字段名",
      "type": "字段类型",
      "comment": "字段注释",
      "isNullable": true/false,
      "isPrimaryKey": true/false,
      "isAutoIncrement": true/false,
      "isUnique": true/false,
      "defaultValue": "默认值",
      "isBasicField": true/false
    }
  ],
  "indexes": [
    {
      "name": "索引名",
      "columns": ["字段1", "字段2"],
      "isUnique": true/false,
      "comment": "索引注释"
    }
  ]
}`
```

**提示词设计要点：**
- 明确角色定位：PostgreSQL 数据库设计专家
- 强制基本字段：id、created_at、updated_at
- PostgreSQL 类型优化：TEXT、JSONB、TIMESTAMPTZ 等
- 强制注释要求：每个字段都必须有中文注释
- 索引策略指导：常用查询字段索引和唯一索引
- JSON 格式输出：结构化的表结构定义

### 上下文管理系统

#### 上下文表信息提取
```typescript
// 获取上下文表信息
if (input.contextTableIds && input.contextTableIds.length > 0) {
  const contextTablesInfo = buildContextTablesInfo(input.contextTableIds)
  prompt += contextTablesInfo
}

const buildContextTablesInfo = async (tableIds: string[]): Promise<string> => {
  const contextTables = await Promise.all(
    tableIds.map(async (tableId) => {
      const table = await getTableById(tableId)
      const columns = await getColumnsByTableId(tableId)
      const indexes = await getIndexesByTableId(tableId)

      return {
        name: table.name,
        comment: table.comment,
        columns: columns.map(col => ({
          name: col.name,
          type: col.type,
          comment: col.comment,
          isNullable: col.isNullable
        })),
        indexes: indexes.map(idx => ({
          name: idx.name,
          columns: JSON.parse(idx.columns),
          isUnique: idx.isUnique
        }))
      }
    })
  )

  return `\n\n参考现有表结构:\n${contextTables.map(table =>
    `表名: ${table.name}\n注释: ${table.comment}\n字段: ${JSON.stringify(table.columns, null, 2)}\n索引: ${JSON.stringify(table.indexes, null, 2)}`
  ).join('\n\n')}`
}
```

**上下文管理特点：**
- 自动加载项目中的所有表作为上下文
- 保留字段命名和类型设计的一致性
- 支持索引策略的学习和应用
- 结构化的表结构信息传递

### 结果解析系统

#### JSON 解析和验证
```typescript
// 解析AI返回的JSON
let aiResponse
try {
  const jsonMatch = result.text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    aiResponse = JSON.parse(jsonMatch[0])
  } else {
    aiResponse = JSON.parse(result.text)
  }
} catch (parseError) {
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'AI返回的数据格式错误，无法解析',
    cause: parseError,
  })
}

// 验证返回的数据结构
if (!Array.isArray(aiResponse)) {
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'AI返回的数据格式错误，期望表数组',
  })
}
```

#### 数据清洗和转换
```typescript
// 标准化表结构数据
const normalizedTables = aiResponse.map((table: any) => ({
  tableName: table.tableName,
  tableComment: table.tableComment || null,
  columns: table.columns.map((col: any, index: number) => ({
    name: col.name,
    type: col.type,
    comment: col.comment || '暂无注释',
    isNullable: Boolean(col.isNullable),
    isPrimaryKey: Boolean(col.isPrimaryKey),
    isAutoIncrement: Boolean(col.isAutoIncrement),
    isUnique: Boolean(col.isUnique),
    defaultValue: col.defaultValue || null,
    isBasicField: ['id', 'created_at', 'updated_at'].includes(col.name),
    orderIndex: index
  })),
  indexes: (table.indexes || []).map((idx: any) => ({
    name: idx.name,
    columns: idx.columns,
    isUnique: Boolean(idx.isUnique),
    comment: idx.comment || null
  }))
}))
```

### 错误处理机制

#### 多层错误处理
```typescript
export const generateTable = publicProcedure
  .input(schemartInputSchema.generateTable)
  .mutation(async ({ input }) => {
    try {
      // 1. 验证提供商可用性
      if (!isProviderAvailable(input.provider)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `AI提供商 ${input.provider} 不可用，请检查API密钥配置`,
        })
      }

      // 2. 解析语言模型
      const model = resolveLanguageModel(input.provider, input.model)

      // 3. 调用AI生成
      const result = await generateText({
        model,
        prompt,
        temperature: 0.1,
        maxTokens: 4000,
      })

      // 4. 解析结果
      const normalizedTables = parseAndNormalizeResult(result.text)

      return { tables: normalizedTables }

    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'AI生成失败',
        cause: error,
      })
    }
  })
```

### AI 功能路由设计

#### 核心路由定义
```typescript
export const schemartAIRouter = router({
  // 生成表结构
  generateTable: publicProcedure
    .input(schemartInputSchema.generateTable)
    .mutation(async ({ input }) => {
      // AI 生成表结构逻辑
    }),

  // 对话式修改表结构
  conversationalEdit: publicProcedure
    .input(schemartInputSchema.conversationalEdit)
    .mutation(async ({ input }) => {
      // 对话式修改逻辑
    }),

  // 保存对话历史
  saveConversation: publicProcedure
    .input(schemartInputSchema.saveConversation)
    .mutation(async ({ input }) => {
      // 保存对话历史逻辑
    })
})
```

## 3. Relevant Code Modules

### AI 提供商核心
- `src/lib/ai/providers/index.ts` - AI 提供商工厂函数和统一接口
- `src/lib/ai/providers/openai.ts` - OpenAI 集成实现
- `src/lib/ai/providers/claude.ts` - Claude 集成实现
- `src/lib/ai/providers/gemini.ts` - Gemini 集成实现

### AI 功能路由
- `src/server/routers/schemart-ai.ts` - AI 功能的核心路由实现
- `src/lib/schema/schemart.ts` - AI 相关的输入验证 schema
- `src/app/(pages)/project/[id]/generate/page.tsx` - AI 生成功能的前端页面

### 配置和环境
- `src/lib/env.ts` - 环境变量验证和 AI 提供商配置
- `package.json` - AI SDK 相关依赖版本
- `src/db/schema/schemart.ts` - 对话历史存储表结构

## 4. Attention

- AI 提示词需要根据模型能力定期更新，确保生成质量
- JSON 解析需要容错处理，AI 可能返回非标准格式
- 上下文表信息量大会影响生成效果，需要控制上下文长度
- 不同 AI 提供商的 API 限制和费用结构需要考虑
- 生成的表结构需要严格验证，避免类型错误和约束冲突
- 对话历史会快速增长，需要考虑存储成本和隐私保护
- AI 生成结果不应直接执行，需要人工审核和确认流程