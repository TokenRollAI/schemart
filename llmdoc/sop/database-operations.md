# 数据库操作流程

## 1. Purpose

规范 Fast MVP 项目中的数据库操作流程，确保数据库 schema 变更的安全性和可追溯性，避免数据丢失和生产环境事故。

## 2. How it Works / Step-by-Step Guide

### 步骤 1: 开发环境数据库操作 (推荐)

**快速 Schema 推送 (开发环境首选):**

```bash
# 直接推送 schema 到数据库，无需生成迁移文件
pnpm db:push
```

**特点:**

- 不生成迁移文件
- 适合快速原型开发
- 会覆盖现有表结构
- ⚠️ 可能导致数据丢失

**使用场景:**

- 项目初始化
- 本地开发环境
- 快速功能测试
- 表结构频繁变更期

**项目初始化示例**:
```bash
# 1. 复制环境变量配置
cp .env.example .env.local

# 2. 推送初始 schema (创建 hello 表)
pnpm db:push

# 3. 验证数据库文件创建
ls -la local.db  # 应该看到 ~16KB 的数据库文件

# 4. 可选：使用 Drizzle Studio 查看结构
pnpm db:studio
```

### 步骤 2: 创建新数据表 (开发环境)

1. **定义表结构**

   ```typescript
   // src/db/schema/your-table.ts
   import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

   export const yourTable = sqliteTable('your_table', {
     id: int().primaryKey({ autoIncrement: true }),
     name: text().notNull(),
     description: text(),
     count: int().notNull().default(0),
   })
   ```

2. **更新数据库连接文件**

   ```typescript
   // src/db/db.ts
   import { yourTable } from './schema/your-table'

   // 在文件底部添加导出
   export { yourTable }
   ```

3. **推送到数据库**

   ```bash
   pnpm db:push
   ```

4. **验证表创建**
   ```bash
   # 打开 Drizzle Studio 查看表结构
   pnpm db:studio
   ```

### 步骤 3: 生产环境迁移流程 (严格执行)

**生成迁移文件 (必需用户确认):**

```bash
# 基于 schema 变更生成迁移文件
pnpm db:generate
```

**生成结果:**

- 创建 `drizzle/` 目录
- 生成带时间戳的 SQL 文件
- 包含 up 和 down 迁移逻辑

**执行迁移 (生产环境):**

```bash
# 应用所有待执行的迁移
pnpm db:migrate
```

**⚠️ 注意事项:**

- 必须先备份生产数据库
- 在低峰期执行迁移
- 提前测试迁移文件
- 准备回滚方案

### 步骤 4: 修改现有表结构

1. **修改 schema 定义**

   ```typescript
   // src/db/schema/your-table.ts
   import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

   export const yourTable = sqliteTable('your_table', {
     id: int().primaryKey({ autoIncrement: true }),
     name: text().notNull(),
     description: text(),
     count: int().notNull().default(0),
     // 添加新字段
     status: text().default('active'),
   })
   ```

2. **开发环境: 直接推送**

   ```bash
   pnpm db:push
   ```

3. **生产环境: 生成迁移**

   ```bash
   # 1. 生成迁移文件
   pnpm db:generate

   # 2. 审查生成的 SQL
   cat drizzle/<timestamp>_migration.sql

   # 3. 在测试环境验证

   # 4. 应用到生产环境
   pnpm db:migrate
   ```

### 步骤 5: 使用 Drizzle Studio

**启动 Studio:**

```bash
pnpm db:studio
```

**功能:**

- 可视化数据库浏览
- 表数据查看和编辑
- Schema 结构检查
- SQL 查询执行

**使用场景:**

- 调试数据问题
- 快速数据查询
- 验证表结构
- 本地数据管理

### 步骤 6: 数据库连接管理

**开发环境配置:**

```bash
# .env.local (从 .env.example 复制)
DB_FILE_NAME=file:local.db
```

**生产环境配置:**

```bash
# 环境变量或部署平台配置
DB_FILE_NAME=libsql://your-database.turso.io
# 如需要认证令牌，需在代码中配置
```

**当前数据库连接实现:**

```typescript
// src/db/db.ts
import { drizzle } from 'drizzle-orm/libsql'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { env } from '@/lib/env'

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
```

### 步骤 7: 数据备份和恢复

**本地备份:**

```bash
# 备份 SQLite 数据库文件
cp local.db local.db.backup.$(date +%Y%m%d_%H%M%S)
```

**生产环境备份:**

```bash
# 如果使用 Turso 或其他托管服务
# 需要通过相应的管理工具或 API 创建备份
```

**恢复备份:**

```bash
# 本地恢复
cp local.db.backup.20240101_120000 local.db

# 生产环境恢复请参考具体托管服务的文档
```

## 3. Relevant Code Modules

### 3.1 数据库配置

- `src/db/db.ts` - 数据库连接管理，使用单例模式
- `drizzle.config.ts` - Drizzle ORM 配置，指向 schema 文件
- `src/lib/env.ts` - 环境变量验证和类型定义

### 3.2 Schema 定义

- `src/db/schema/` - 所有数据表定义文件
- 当前只有一个示例表：`src/db/schema/hello.ts`

### 3.3 迁移文件

- `drizzle/` - 生成的迁移 SQL 文件目录（首次运行迁移时创建）

### 3.4 脚本配置

- `package.json` - 数据库相关脚本：
  - `db:push` - 开发环境快速推送 schema
  - `db:generate` - 生成迁移文件
  - `db:migrate` - 执行迁移
  - `db:studio` - 启动 Drizzle Studio

## 4. Attention

- **开发环境优先使用 db:push**: 快速迭代，无需生成迁移文件
- **生产环境必须使用 db:migrate**: 确保变更可追溯和可回滚
- **禁止自动创建迁移**: 除非获得明确用户确认
- **数据丢失风险**: `db:push` 可能覆盖现有数据，谨慎使用
- **备份优先**: 任何生产环境操作前必须备份
- **导入方式**: 新建表后需要在 `src/db/db.ts` 中导入并导出表定义
- **配置文件**: 环境变量通过 `src/lib/env.ts` 验证，确保类型安全
- **数据库文件**: 本地开发使用 `local.db` SQLite 文件
- **SQLite 限制**: 注意 SQLite 的并发限制和功能约束
