# 数据库设计

## 1. Purpose

详细描述 Schemart 项目的数据库表结构设计，包含核心业务表、关系模型、索引策略和数据完整性约束，为数据库操作和维护提供设计参考。

## 2. How it Works

### 数据库架构概览

项目采用 SQLite 作为元数据存储，通过 Drizzle ORM 进行类型安全的数据库操作。数据库设计遵循关系型数据库范式，支持层级化的数据管理需求。

**核心关系模型：**
```
projects (1:N) tables (1:N) columns
tables (1:N) indexes
tables (1:N) conversation_history
tables (1:N) table_history
```

### 核心表结构设计

#### 项目表 (projects)

存储项目基本信息和元数据。

```sql
CREATE TABLE "projects" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);
```

**设计要点：**
- 使用自增主键确保唯一性
- `name` 字段为必填项，支持项目标识
- `description` 为可选字段，提供项目描述
- 时间戳使用 Unix 时间戳格式，便于计算和比较

#### 表定义表 (tables)

存储数据库表的元数据定义。

```sql
CREATE TABLE "tables" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "projectId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "comment" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
);
```

**设计要点：**
- 通过 `projectId` 外键关联项目，支持级联删除
- `name` 字段存储表名，遵循数据库命名规范
- `comment` 字段存储表注释，提供文档说明
- 支持同一项目内的多个表管理

#### 列定义表 (columns)

存储表字段的详细定义信息。

```sql
CREATE TABLE "columns" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "tableId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "comment" TEXT NOT NULL,
  "isNullable" INTEGER NOT NULL DEFAULT 0,
  "isPrimaryKey" INTEGER NOT NULL DEFAULT 0,
  "isAutoIncrement" INTEGER NOT NULL DEFAULT 0,
  "isUnique" INTEGER NOT NULL DEFAULT 0,
  "defaultValue" TEXT,
  "isBasicField" INTEGER NOT NULL DEFAULT 0,
  "orderIndex" INTEGER NOT NULL,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  FOREIGN KEY ("tableId") REFERENCES "tables" ("id") ON DELETE CASCADE
);
```

**设计要点：**
- 完整的字段属性定义：类型、约束、注释、默认值
- 布尔值使用整数存储（0/1），确保 SQLite 兼容性
- `isBasicField` 区分系统字段和业务字段
- `orderIndex` 支持字段排序，保持定义顺序
- 强制要求 `comment` 字段，确保文档完整性

#### 索引定义表 (indexes)

存储表索引的定义信息。

```sql
CREATE TABLE "indexes" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "tableId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "columns" TEXT NOT NULL,
  "isUnique" INTEGER NOT NULL DEFAULT 0,
  "comment" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  FOREIGN KEY ("tableId") REFERENCES "tables" ("id") ON DELETE CASCADE
);
```

**设计要点：**
- `columns` 字段使用 JSON 格式存储多列索引，支持复合索引
- `isUnique` 标识唯一索引，用于数据完整性约束
- `comment` 字段提供索引说明和用途描述
- 支持单列和复合索引的统一管理

### 历史记录表设计

#### 对话历史表 (conversation_history)

存储 AI 生成表结构时的对话记录。

```sql
CREATE TABLE "conversation_history" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "tableId" INTEGER NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" INTEGER NOT NULL,
  FOREIGN KEY ("tableId") REFERENCES "tables" ("id") ON DELETE CASCADE
);
```

**设计要点：**
- `role` 字段区分用户输入和 AI 回复（user/assistant）
- `content` 存储完整的对话内容
- 支持多轮对话的历史记录追踪
- 表删除时自动清理相关对话历史

#### 表变更历史表 (table_history)

存储表结构变更的完整历史记录。

```sql
CREATE TABLE "table_history" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "tableId" INTEGER NOT NULL,
  "changeType" TEXT NOT NULL,
  "changeSummary" TEXT NOT NULL,
  "sqlStatements" TEXT NOT NULL,
  "snapshot" TEXT NOT NULL,
  "createdAt" INTEGER NOT NULL,
  FOREIGN KEY ("tableId") REFERENCES "tables" ("id") ON DELETE CASCADE
);
```

**设计要点：**
- `changeType` 标识变更类型（create/update/delete）
- `changeSummary` 提供变更的简要描述
- `sqlStatements` 存储实际的 SQL 变更语句
- `snapshot` 存储 JSON 格式的完整表结构快照
- 支持版本回滚和变更追踪

### 数据完整性约束

#### 外键约束
- `tables.projectId` → `projects.id` (ON DELETE CASCADE)
- `columns.tableId` → `tables.id` (ON DELETE CASCADE)
- `indexes.tableId` → `tables.id` (ON DELETE CASCADE)
- `conversation_history.tableId` → `tables.id` (ON DELETE CASCADE)
- `table_history.tableId` → `tables.id` (ON DELETE CASCADE)

#### 唯一性约束
- 项目名称在同一层级内应保持唯一
- 表名在同一项目内应保持唯一
- 列名在同一表内应保持唯一
- 索引名在同一表内应保持唯一

#### 数据验证约束
- 所有表必须包含基本的审计字段（createdAt, updatedAt）
- 列定义必须包含注释信息
- 时间戳字段使用 Unix 时间戳格式
- 布尔值字段使用整数格式（0/1）

### 索引策略

#### 主要索引
```sql
-- 项目查找优化
CREATE INDEX idx_tables_projectId ON tables(projectId);

-- 表关联查找优化
CREATE INDEX idx_columns_tableId ON columns(tableId);
CREATE INDEX idx_columns_tableId_order ON columns(tableId, orderIndex);

-- 索引查找优化
CREATE INDEX idx_indexes_tableId ON indexes(tableId);

-- 历史记录查找优化
CREATE INDEX idx_conversation_history_tableId ON conversation_history(tableId);
CREATE INDEX idx_table_history_tableId ON table_history(tableId);
CREATE INDEX idx_table_history_tableId_created ON table_history(tableId, createdAt);
```

#### 查询优化考虑
- 项目列表查询优化：按创建时间排序
- 表结构查询优化：按 orderIndex 排序
- 历史记录查询优化：按时间倒序排列
- 关联查询优化：外键字段建立索引

### 数据迁移策略

#### 版本管理
- 使用 Drizzle Kit 进行数据库迁移管理
- 迁移文件包含 schema 变更和数据转换
- 支持向前和向后迁移操作

#### 数据兼容性
- 新增字段使用默认值确保向后兼容
- 字段类型变更需要数据转换脚本
- 表结构变更需要考虑现有数据迁移

## 3. Relevant Code Modules

### 数据库核心文件
- `src/db/db.ts` - 数据库连接管理和配置
- `src/db/schema/schemart.ts` - 完整的数据库 schema 定义
- `src/lib/schema/schemart.ts` - 数据库操作的 Zod 验证 schema

### 数据库操作文件
- `src/server/routers/schemart.ts` - 核心业务 CRUD 操作
- `src/server/routers/schemart-ai.ts` - AI 功能相关的数据库操作
- `src/server/routers/schemart-tools.ts` - 工具功能的数据库操作

### 配置和工具
- `package.json` - 数据库相关依赖和脚本
- `drizzle.config.ts` - Drizzle ORM 配置文件
- `src/lib/env.ts` - 数据库连接环境变量配置

## 4. Attention

- SQLite 不支持布尔类型，必须使用整数（0/1）存储布尔值
- JSON 字段在 SQLite 中存储为文本，查询时需要 JSON 函数支持
- 外键约束需要手动启用，默认情况下 SQLite 不强制外键约束
- 时间戳统一使用 Unix 时间戳格式，便于跨平台兼容
- 表更新采用删除重建策略，在高并发场景下需要考虑事务隔离
- 数据库文件路径通过环境变量配置，确保生产环境的数据持久化
- 历史记录表会快速增长，需要定期清理或归档策略