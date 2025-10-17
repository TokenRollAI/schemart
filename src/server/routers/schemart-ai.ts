import { publicProcedure, router } from '../trpc'
import {
  db,
  projectsTable,
  tablesTable,
  columnsTable,
  indexesTable,
  conversationHistoryTable,
} from '@/db/db'
import { eq, desc } from 'drizzle-orm'
import { schemartInputSchema } from '@/lib/schema/schemart'
import { TRPCError } from '@trpc/server'
import { resolveLanguageModel } from '@/lib/ai/providers'
import { generateText } from 'ai'

export const schemartAIRouter = router({
  // ==================== AI生成表结构 ====================
  generateTableFromDescription: publicProcedure
    .input(schemartInputSchema.generateTableFromDescription)
    .mutation(async ({ input }) => {
      try {
        const languageModel = resolveLanguageModel(input.provider, input.model)

        // 获取上下文表信息
        let contextTablesInfo = ''
        if (input.contextTableIds && input.contextTableIds.length > 0) {
          const contextTables = await Promise.all(
            input.contextTableIds.map(async (tableId) => {
              const table = await db
                .select()
                .from(tablesTable)
                .where(eq(tablesTable.id, tableId))
                .limit(1)

              if (table.length === 0) return null

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
                columns: columns.map((col) => ({
                  name: col.name,
                  type: col.type,
                  comment: col.comment,
                  isNullable: col.isNullable === 1,
                  isPrimaryKey: col.isPrimaryKey === 1,
                })),
                indexes: indexes.map((idx) => ({
                  name: idx.name,
                  columns: JSON.parse(idx.columns),
                  isUnique: idx.isUnique === 1,
                })),
              }
            })
          )

          const validContextTables = contextTables.filter(
            (t): t is NonNullable<typeof t> => t !== null
          )

          if (validContextTables.length > 0) {
            contextTablesInfo = `\n\n现有表结构参考（可以参考这些表的设计风格和字段命名）:\n${validContextTables
              .map(
                (t) =>
                  `\n表名: ${t.name}\n表注释: ${t.comment || '无'}\n列:\n${t.columns.map((c) => `  - ${c.name} ${c.type} ${c.comment} ${c.isNullable ? 'NULL' : 'NOT NULL'} ${c.isPrimaryKey ? 'PRIMARY KEY' : ''}`).join('\n')}\n索引:\n${t.indexes.length > 0 ? t.indexes.map((i) => `  - ${i.name} (${i.columns.join(', ')}) ${i.isUnique ? 'UNIQUE' : ''}`).join('\n') : '  无索引'}`
              )
              .join('\n')}`
          }
        }

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

请以JSON格式返回，格式如下:
{
  "tables": [
    {
      "name": "表名(英文小写，下划线分隔)",
      "comment": "表的中文注释",
      "columns": [
        {
          "name": "id",
          "type": "SERIAL",
          "comment": "主键ID",
          "isNullable": false,
          "isPrimaryKey": true,
          "isAutoIncrement": true,
          "isUnique": false,
          "isBasicField": true,
          "orderIndex": 0
        },
        {
          "name": "created_at",
          "type": "TIMESTAMPTZ",
          "comment": "创建时间",
          "isNullable": false,
          "isPrimaryKey": false,
          "isAutoIncrement": false,
          "isUnique": false,
          "defaultValue": "CURRENT_TIMESTAMP",
          "isBasicField": true,
          "orderIndex": 998
        },
        {
          "name": "updated_at",
          "type": "TIMESTAMPTZ",
          "comment": "更新时间",
          "isNullable": false,
          "isPrimaryKey": false,
          "isAutoIncrement": false,
          "isUnique": false,
          "defaultValue": "CURRENT_TIMESTAMP",
          "isBasicField": true,
          "orderIndex": 999
        }
      ],
      "indexes": [
        {
          "name": "索引名",
          "columns": ["列名"],
          "isUnique": false,
          "comment": "索引说明"
        }
      ]
    }
  ]
}

注意:
- 只返回JSON，不要包含任何其他文字
- 使用PostgreSQL语法和类型: TEXT, JSONB, SERIAL, BIGSERIAL, TIMESTAMPTZ, UUID等
- isBasicField=true表示基本字段，false表示业务字段
- 基本字段的orderIndex应该是0(id)、998(created_at)、999(updated_at)
- 业务字段的orderIndex从1开始按顺序递增`

        const result = await generateText({
          model: languageModel,
          messages: [{ role: 'user', content: prompt }],
        })

        // 解析AI返回的JSON
        let aiResponse
        try {
          // 尝试提取JSON内容
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

        return {
          success: true,
          tables: aiResponse.tables,
        }
      } catch (error) {
        console.error('AI生成表结构失败:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase()

          if (
            errorMessage.includes('api key') ||
            errorMessage.includes('authentication')
          ) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: `API key 未配置或无效 (${input.provider})`,
              cause: error,
            })
          }

          if (errorMessage.includes('rate limit')) {
            throw new TRPCError({
              code: 'TOO_MANY_REQUESTS',
              message: '请求过于频繁，请稍后再试',
              cause: error,
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'AI生成失败',
          cause: error,
        })
      }
    }),

  // ==================== AI对话修改表结构 ====================
  chatModifyTable: publicProcedure
    .input(schemartInputSchema.chatModifyTable)
    .mutation(async ({ input }) => {
      try {
        const now = Math.floor(Date.now() / 1000)

        // 获取当前表结构
        const table = await db
          .select()
          .from(tablesTable)
          .where(eq(tablesTable.id, input.tableId))
          .limit(1)

        if (table.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '表不存在',
          })
        }

        const columns = await db
          .select()
          .from(columnsTable)
          .where(eq(columnsTable.tableId, input.tableId))
          .orderBy(columnsTable.orderIndex)

        const indexes = await db
          .select()
          .from(indexesTable)
          .where(eq(indexesTable.tableId, input.tableId))

        // 获取对话历史
        const history = await db
          .select()
          .from(conversationHistoryTable)
          .where(eq(conversationHistoryTable.tableId, input.tableId))
          .orderBy(conversationHistoryTable.createdAt)
          .limit(10) // 最多保留10条历史

        // 构建对话消息
        const messages = [
          {
            role: 'system' as const,
            content: `你是一个数据库设计专家。用户想要修改表结构。当前表结构如下:

表名: ${table[0].name}
表注释: ${table[0].comment || '无'}

列:
${columns.map((col) => `- ${col.name} ${col.type} ${col.comment} ${col.isNullable ? 'NULL' : 'NOT NULL'} ${col.isPrimaryKey ? 'PRIMARY KEY' : ''} ${col.isBasicField ? '[基本字段]' : '[业务字段]'}`).join('\n')}

索引:
${indexes.map((idx) => `- ${idx.name} (${JSON.parse(idx.columns).join(', ')}) ${idx.isUnique ? 'UNIQUE' : ''} ${idx.comment || ''}`).join('\n')}

请根据用户的需求，返回修改后的完整表结构。返回JSON格式:
{
  "name": "表名",
  "comment": "表注释",
  "columns": [...],
  "indexes": [...],
  "changeSummary": "修改说明"
}

注意:
- 保持基本字段(id, created_at, updated_at)不变
- 每一列都必须要有详细的中文注释
- 只返回JSON，不要包含任何其他文字`,
          },
          ...history.map((h) => ({
            role: h.role as 'user' | 'assistant',
            content: h.content,
          })),
          {
            role: 'user' as const,
            content: input.message,
          },
        ]

        const languageModel = resolveLanguageModel(input.provider, input.model)

        const result = await generateText({
          model: languageModel,
          messages,
        })

        // 保存对话历史
        await db.insert(conversationHistoryTable).values([
          {
            tableId: input.tableId,
            role: 'user',
            content: input.message,
            createdAt: now,
          },
          {
            tableId: input.tableId,
            role: 'assistant',
            content: result.text,
            createdAt: now,
          },
        ])

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

        return {
          success: true,
          modifiedTable: aiResponse,
          message: result.text,
        }
      } catch (error) {
        console.error('AI对话修改表结构失败:', error)

        if (error instanceof TRPCError) {
          throw error
        }

        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase()

          if (
            errorMessage.includes('api key') ||
            errorMessage.includes('authentication')
          ) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: `API key 未配置或无效 (${input.provider})`,
              cause: error,
            })
          }
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'AI对话失败',
          cause: error,
        })
      }
    }),

  // ==================== 获取对话历史 ====================
  getConversationHistory: publicProcedure
    .input(schemartInputSchema.getConversationHistory)
    .query(async ({ input }) => {
      const history = await db
        .select()
        .from(conversationHistoryTable)
        .where(eq(conversationHistoryTable.tableId, input.tableId))
        .orderBy(conversationHistoryTable.createdAt)

      return history
    }),
})
