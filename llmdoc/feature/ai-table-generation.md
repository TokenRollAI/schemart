# AI 表结构生成

## 1. Purpose

描述 Schemart 项目的 AI 智能生成表结构功能的核心实现,包含提示词工程、上下文管理、结果解析和数据清洗,为 AI 功能开发和优化提供技术参考。

## 2. How it Works

### 核心生成流程

AI 表结构生成采用单轮或多轮对话模式,通过精心设计的提示词和上下文管理,确保生成的表结构符合 PostgreSQL 最佳实践。

**生成流程:**
```
用户输入描述
  ↓
加载上下文表信息
  ↓
构建完整提示词
  ↓
调用 AI 模型生成
  ↓
解析 JSON 响应
  ↓
数据验证和清洗
  ↓
返回标准化表结构
```

### PostgreSQL 专用提示词设计

**核心提示词结构:**
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

**提示词设计要点:**
- **角色定位**: PostgreSQL 数据库设计专家
- **技术规范**: 明确 PostgreSQL 类型系统
- **字段标准**: 强制基本字段和注释
- **类型推荐**: TEXT、JSONB、TIMESTAMPTZ 优先
- **索引策略**: 常用查询和唯一性约束
- **格式要求**: JSON 数组输出

### 上下文管理系统

#### 自动上下文加载
```typescript
// 获取项目的所有表作为上下文
const tables = await db
  .select()
  .from(tablesTable)
  .where(eq(tablesTable.projectId, input.projectId))

const allTableIds = tables.map(t => t.id)

// 构建上下文信息
const contextTablesInfo = await buildContextInfo(allTableIds)
```

#### 上下文信息构建
```typescript
const buildContextInfo = async (tableIds: string[]): Promise<string> => {
  if (!tableIds || tableIds.length === 0) {
    return ''
  }

  const contextTables = await Promise.all(
    tableIds.map(async (tableId) => {
      const table = await db
        .select()
        .from(tablesTable)
        .where(eq(tablesTable.id, tableId))
        .limit(1)

      const columns = await db
        .select()
        .from(columnsTable)
        .where(eq(columnsTable.tableId, tableId))
        .orderBy(columnsTable.orderIndex)

      const indexes = await db
        .select()
        .from(indexesTable)
        .where(eq(indexesTable.tableId, tableId))

      return {
        name: table[0].name,
        comment: table[0].comment,
        columns: columns.map(col => ({
          name: col.name,
          type: col.type,
          comment: col.comment,
          isNullable: !!col.isNullable,
          isPrimaryKey: !!col.isPrimaryKey
        })),
        indexes: indexes.map(idx => ({
          name: idx.name,
          columns: JSON.parse(idx.columns),
          isUnique: !!idx.isUnique
        }))
      }
    })
  )

  return `\n\n参考现有表结构:\n${contextTables.map(table =>
    `表名: ${table.name}\n注释: ${table.comment}\n` +
    `字段: ${JSON.stringify(table.columns, null, 2)}\n` +
    `索引: ${JSON.stringify(table.indexes, null, 2)}`
  ).join('\n\n')}`
}
```

**上下文价值:**
- 保持命名风格一致性
- 学习字段类型选择
- 继承索引策略
- 理解业务领域模型

### AI 模型调用

```typescript
// 解析语言模型
const model = resolveLanguageModel(input.provider, input.model)

// 调用 AI 生成
const result = await generateText({
  model,
  prompt,
  temperature: 0.1,  // 低温度确保稳定输出
  maxTokens: 4000,   // 足够的 token 预算
})
```

### 结果解析和验证

#### JSON 提取和解析
```typescript
let aiResponse
try {
  // 尝试提取 JSON 片段
  const jsonMatch = result.text.match(/\{[\s\S]*\}/)

  if (jsonMatch) {
    aiResponse = JSON.parse(jsonMatch[0])
  } else {
    // 尝试直接解析
    aiResponse = JSON.parse(result.text)
  }
} catch (parseError) {
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'AI返回的数据格式错误，无法解析',
    cause: parseError,
  })
}
```

#### 数据结构验证
```typescript
// 验证返回的数据是数组
if (!Array.isArray(aiResponse)) {
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'AI返回的数据格式错误，期望表数组',
  })
}

// 验证每个表的结构
for (const table of aiResponse) {
  if (!table.tableName || !table.columns) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `表结构缺少必需字段: ${JSON.stringify(table)}`,
    })
  }
}
```

#### 数据标准化清洗
```typescript
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

**数据清洗要点:**
- 类型转换: 布尔值标准化
- 默认值处理: null 和空字符串
- 基本字段标记: id/created_at/updated_at
- 排序索引: 保持字段顺序
- 注释补全: 确保所有字段有注释

### 错误处理机制

#### 多层错误处理
```typescript
try {
  // 1. 验证提供商可用性
  if (!isProviderAvailable(input.provider)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `AI提供商 ${input.provider} 不可用`,
    })
  }

  // 2. 生成表结构
  const result = await generateText({ model, prompt, ... })

  // 3. 解析结果
  const normalizedTables = parseAndNormalize(result.text)

  return { tables: normalizedTables }

} catch (error) {
  if (error instanceof TRPCError) {
    throw error
  }

  // 未知错误处理
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'AI生成失败',
    cause: error,
  })
}
```

### 生成结果优化

**基本字段自动标记:**
```typescript
isBasicField: ['id', 'created_at', 'updated_at'].includes(col.name)
```

**字段顺序保持:**
```typescript
columns: table.columns.map((col, index) => ({
  ...col,
  orderIndex: col.orderIndex || index
}))
```

**索引数组解析:**
```typescript
indexes: (table.indexes || []).map((idx) => ({
  name: idx.name,
  columns: Array.isArray(idx.columns) ? idx.columns : [idx.columns],
  isUnique: Boolean(idx.isUnique)
}))
```

## 3. Relevant Code Modules

### AI 生成核心
- `src/server/routers/schemart-ai.ts` - AI 生成路由实现 (generateTable procedure)
- `src/lib/ai/providers/index.ts` - AI 提供商解析和工厂函数
- `src/lib/schema/schemart.ts` - 输入验证 schema (generateTable)

### 前端集成
- `src/app/(pages)/project/[id]/generate/page.tsx` - AI 生成页面
- `src/components/providers/TrpcProvider.tsx` - tRPC 客户端配置

### 数据库
- `src/db/schema/schemart.ts` - 表结构定义 (conversation_history)
- `src/db/db.ts` - 数据库连接管理

## 4. Attention

- 提示词需要定期优化,根据 AI 模型能力调整
- 上下文表数量过多会超过 token 限制,需要控制
- JSON 解析需要容错处理,AI 可能返回非标准格式
- 生成的表结构不应直接执行,需要人工审核
- 基本字段（id、created_at、updated_at）必须包含
- 字段注释强制要求,确保文档完整性
- 温度参数设置为 0.1,确保输出稳定性
- 不同 AI 提供商的输出格式可能略有差异