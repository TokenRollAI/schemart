import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Project表 - 存储项目信息
export const projectsTable = sqliteTable('projects', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  createdAt: int().notNull(), // Unix timestamp
  updatedAt: int().notNull(),
})

// Table表 - 存储表结构信息
export const tablesTable = sqliteTable('tables', {
  id: int().primaryKey({ autoIncrement: true }),
  projectId: int().notNull(),
  name: text().notNull(),
  comment: text(),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
})

// Column表 - 存储列信息
export const columnsTable = sqliteTable('columns', {
  id: int().primaryKey({ autoIncrement: true }),
  tableId: int().notNull(),
  name: text().notNull(),
  type: text().notNull(), // VARCHAR(255), INT, TEXT, etc.
  comment: text().notNull(), // 每一列都必须要有注释
  isNullable: int().notNull().default(0), // 0=NOT NULL, 1=NULL
  isPrimaryKey: int().notNull().default(0), // 0=false, 1=true
  isAutoIncrement: int().notNull().default(0), // 0=false, 1=true
  isUnique: int().notNull().default(0), // 0=false, 1=true
  defaultValue: text(), // 默认值
  isBasicField: int().notNull().default(0), // 0=业务字段, 1=基本字段(id, createdAt, updatedAt, extra)
  orderIndex: int().notNull(), // 显示顺序
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
})

// Index表 - 存储索引信息
export const indexesTable = sqliteTable('indexes', {
  id: int().primaryKey({ autoIncrement: true }),
  tableId: int().notNull(),
  name: text().notNull(),
  columns: text().notNull(), // JSON array of column names ["col1", "col2"]
  isUnique: int().notNull().default(0), // 0=普通索引, 1=唯一索引
  comment: text(),
  createdAt: int().notNull(),
  updatedAt: int().notNull(),
})

// ConversationHistory表 - 存储AI对话历史
export const conversationHistoryTable = sqliteTable('conversation_history', {
  id: int().primaryKey({ autoIncrement: true }),
  tableId: int().notNull(),
  role: text().notNull(), // 'user' | 'assistant' | 'system'
  content: text().notNull(),
  createdAt: int().notNull(),
})

// TableHistory表 - 存储表结构变更历史
export const tableHistoryTable = sqliteTable('table_history', {
  id: int().primaryKey({ autoIncrement: true }),
  tableId: int().notNull(),
  changeType: text().notNull(), // 'create' | 'update' | 'delete'
  changeSummary: text().notNull(), // 变更说明
  sqlStatements: text().notNull(), // SQL变更语句 (JSON array)
  snapshot: text().notNull(), // 完整的表结构快照 (JSON)
  createdAt: int().notNull(),
})
