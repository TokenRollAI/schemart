import { z } from 'zod'

// Column Schema
const columnSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, '列名不能为空'),
  type: z.string().min(1, '类型不能为空'),
  comment: z.string().min(1, '注释不能为空'), // 必须要有注释
  isNullable: z.boolean().default(false),
  isPrimaryKey: z.boolean().default(false),
  isAutoIncrement: z.boolean().default(false),
  isUnique: z.boolean().default(false),
  defaultValue: z.string().nullish(),
  isBasicField: z.boolean().default(false),
  orderIndex: z.number().default(0),
})

// Index Schema
const indexSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, '索引名不能为空'),
  columns: z.array(z.string()).min(1, '索引至少需要一个列'),
  isUnique: z.boolean().default(false),
  comment: z.string().optional(),
})

// Table Schema
const tableSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, '表名不能为空'),
  comment: z.string().optional(),
  columns: z.array(columnSchema),
  indexes: z.array(indexSchema).optional(),
})

export const schemartInputSchema = {
  // Project CRUD
  createProject: z.object({
    name: z.string().min(1, '项目名不能为空'),
    description: z.string().optional(),
  }),

  updateProject: z.object({
    id: z.number(),
    name: z.string().min(1, '项目名不能为空').optional(),
    description: z.string().optional(),
  }),

  deleteProject: z.object({
    id: z.number(),
  }),

  getProject: z.object({
    id: z.number(),
  }),

  getAllProjects: z.object({}),

  // Table CRUD
  createTable: z.object({
    projectId: z.number(),
    name: z.string().min(1, '表名不能为空'),
    comment: z.string().optional(),
    columns: z.array(columnSchema),
    indexes: z.array(indexSchema).optional(),
  }),

  updateTable: z.object({
    id: z.number(),
    name: z.string().min(1, '表名不能为空').optional(),
    comment: z.string().optional(),
    columns: z.array(columnSchema).optional(),
    indexes: z.array(indexSchema).optional(),
  }),

  deleteTable: z.object({
    id: z.number(),
  }),

  getTable: z.object({
    id: z.number(),
  }),

  getTablesByProject: z.object({
    projectId: z.number(),
  }),

  // AI生成表结构
  generateTableFromDescription: z.object({
    projectId: z.number(),
    description: z.string().min(1, '描述不能为空'),
    provider: z.enum(['openai', 'claude', 'gemini']).default('openai'),
    model: z.string().optional(),
    contextTableIds: z.array(z.number()).optional(), // 可选的上下文表ID列表
  }),

  // AI对话修改表结构
  chatModifyTable: z.object({
    tableId: z.number(),
    message: z.string().min(1, '消息不能为空'),
    provider: z.enum(['openai', 'claude', 'gemini']).default('openai'),
    model: z.string().optional(),
  }),

  // 获取对话历史
  getConversationHistory: z.object({
    tableId: z.number(),
  }),

  // 生成SQL变更语句
  generateSQLDiff: z.object({
    tableId: z.number(),
    targetDatabaseType: z
      .enum(['mysql', 'postgresql', 'sqlite'])
      .default('mysql'),
  }),

  // 导入导出
  exportProject: z.object({
    id: z.number(),
  }),

  importProject: z.object({
    data: z.string(), // JSON string
  }),

  // 获取表变更历史
  getTableHistory: z.object({
    tableId: z.number(),
  }),
}

// Export types
export type CreateProjectInput = z.infer<
  typeof schemartInputSchema.createProject
>
export type UpdateProjectInput = z.infer<
  typeof schemartInputSchema.updateProject
>
export type DeleteProjectInput = z.infer<
  typeof schemartInputSchema.deleteProject
>
export type GetProjectInput = z.infer<typeof schemartInputSchema.getProject>
export type GetAllProjectsInput = z.infer<
  typeof schemartInputSchema.getAllProjects
>

export type CreateTableInput = z.infer<typeof schemartInputSchema.createTable>
export type UpdateTableInput = z.infer<typeof schemartInputSchema.updateTable>
export type DeleteTableInput = z.infer<typeof schemartInputSchema.deleteTable>
export type GetTableInput = z.infer<typeof schemartInputSchema.getTable>
export type GetTablesByProjectInput = z.infer<
  typeof schemartInputSchema.getTablesByProject
>

export type GenerateTableFromDescriptionInput = z.infer<
  typeof schemartInputSchema.generateTableFromDescription
>
export type ChatModifyTableInput = z.infer<
  typeof schemartInputSchema.chatModifyTable
>
export type GetConversationHistoryInput = z.infer<
  typeof schemartInputSchema.getConversationHistory
>
export type GenerateSQLDiffInput = z.infer<
  typeof schemartInputSchema.generateSQLDiff
>
export type ExportProjectInput = z.infer<
  typeof schemartInputSchema.exportProject
>
export type ImportProjectInput = z.infer<
  typeof schemartInputSchema.importProject
>
export type GetTableHistoryInput = z.infer<
  typeof schemartInputSchema.getTableHistory
>

export type Column = z.infer<typeof columnSchema>
export type Index = z.infer<typeof indexSchema>
export type Table = z.infer<typeof tableSchema>
