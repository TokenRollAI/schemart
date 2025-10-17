# 表结构管理

## 1. Purpose

描述 Schemart 项目的表结构 CRUD 操作实现,包含项目管理、表管理、列管理和索引管理的完整功能,为数据管理功能开发提供技术参考。

## 2. How it Works

### 项目管理 (Project CRUD)

#### 创建项目
```typescript
createProject: publicProcedure
  .input(schemartInputSchema.createProject)
  .mutation(async ({ input }) => {
    const now = Math.floor(Date.now() / 1000)

    const newProject = await db.insert(projectsTable).values({
      name: input.name,
      description: input.description || null,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return newProject[0]
  })
```

**设计要点:**
- Unix 时间戳确保时间一致性
- 描述字段可选
- 返回完整的创建后对象

#### 获取项目列表
```typescript
getProjects: publicProcedure
  .query(async () => {
    const projects = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        description: projectsTable.description,
        createdAt: projectsTable.createdAt,
        updatedAt: projectsTable.updatedAt,
        tableCount: sql<number>`count(${tablesTable.id})`.as('tableCount')
      })
      .from(projectsTable)
      .leftJoin(tablesTable, eq(projectsTable.id, tablesTable.projectId))
      .groupBy(projectsTable.id)
      .orderBy(desc(projectsTable.updatedAt))

    return projects
  })
```

**查询优化:**
- 使用 LEFT JOIN 统计表数量
- GROUP BY 聚合计数
- 按更新时间倒序排列

#### 级联删除项目
```typescript
deleteProject: publicProcedure
  .input(schemartInputSchema.deleteProject)
  .mutation(async ({ input }) => {
    // 获取项目下的所有表
    const tables = await db
      .select()
      .from(tablesTable)
      .where(eq(tablesTable.projectId, input.id))

    // 级联删除相关数据
    for (const table of tables) {
      // 删除列
      await db.delete(columnsTable)
        .where(eq(columnsTable.tableId, table.id))

      // 删除索引
      await db.delete(indexesTable)
        .where(eq(indexesTable.tableId, table.id))

      // 删除对话历史
      await db.delete(conversationHistoryTable)
        .where(eq(conversationHistoryTable.tableId, table.id))

      // 删除表历史
      await db.delete(tableHistoryTable)
        .where(eq(tableHistoryTable.tableId, table.id))
    }

    // 删除表
    await db.delete(tablesTable)
      .where(eq(tablesTable.projectId, input.id))

    // 删除项目
    await db.delete(projectsTable)
      .where(eq(projectsTable.id, input.id))

    return { success: true }
  })
```

**级联策略:**
- 先删除子表数据 (列、索引、历史)
- 再删除表记录
- 最后删除项目记录
- 确保数据完整性

### 表管理 (Table CRUD)

#### 创建表（原子性操作）
```typescript
createTable: publicProcedure
  .input(schemartInputSchema.createTable)
  .mutation(async ({ input }) => {
    const now = Math.floor(Date.now() / 1000)

    // 1. 创建表记录
    const newTable = await db.insert(tablesTable).values({
      projectId: input.projectId,
      name: input.name,
      comment: input.comment || null,
      createdAt: now,
      updatedAt: now,
    }).returning()

    const tableId = newTable[0].id

    // 2. 批量创建列
    if (input.columns && input.columns.length > 0) {
      const columnsData = input.columns.map((col, index) => ({
        tableId,
        name: col.name,
        type: col.type,
        comment: col.comment,
        isNullable: col.isNullable ? 1 : 0,
        isPrimaryKey: col.isPrimaryKey ? 1 : 0,
        isAutoIncrement: col.isAutoIncrement ? 1 : 0,
        isUnique: col.isUnique ? 1 : 0,
        defaultValue: col.defaultValue || null,
        isBasicField: col.isBasicField ? 1 : 0,
        orderIndex: col.orderIndex || index,
        createdAt: now,
        updatedAt: now,
      }))

      await db.insert(columnsTable).values(columnsData)
    }

    // 3. 批量创建索引
    if (input.indexes && input.indexes.length > 0) {
      const indexesData = input.indexes.map((idx) => ({
        tableId,
        name: idx.name,
        columns: JSON.stringify(idx.columns),
        isUnique: idx.isUnique ? 1 : 0,
        comment: idx.comment || null,
        createdAt: now,
        updatedAt: now,
      }))

      await db.insert(indexesTable).values(indexesData)
    }

    return newTable[0]
  })
```

**原子性保障:**
- 按顺序创建: 表 → 列 → 索引
- 布尔值转整数 (SQLite 兼容)
- orderIndex 自动设置
- 批量插入优化性能

#### 更新表（删除重建策略）
```typescript
updateTable: publicProcedure
  .input(schemartInputSchema.updateTable)
  .mutation(async ({ input }) => {
    const now = Math.floor(Date.now() / 1000)

    // 获取旧数据用于历史记录
    const oldColumns = await db
      .select()
      .from(columnsTable)
      .where(eq(columnsTable.tableId, input.id))
      .orderBy(columnsTable.orderIndex)

    const oldIndexes = await db
      .select()
      .from(indexesTable)
      .where(eq(indexesTable.tableId, input.id))

    // 更新表基本信息
    const updatedTable = await db
      .update(tablesTable)
      .set({
        name: input.name,
        comment: input.comment,
        updatedAt: now,
      })
      .where(eq(tablesTable.id, input.id))
      .returning()

    // 更新列定义（删除重建）
    if (input.columns) {
      await db.delete(columnsTable)
        .where(eq(columnsTable.tableId, input.id))

      const columnsData = input.columns.map((col, index) => ({
        tableId: input.id,
        name: col.name,
        type: col.type,
        comment: col.comment,
        isNullable: col.isNullable ? 1 : 0,
        isPrimaryKey: col.isPrimaryKey ? 1 : 0,
        isAutoIncrement: col.isAutoIncrement ? 1 : 0,
        isUnique: col.isUnique ? 1 : 0,
        defaultValue: col.defaultValue || null,
        isBasicField: col.isBasicField ? 1 : 0,
        orderIndex: col.orderIndex || index,
        createdAt: now,
        updatedAt: now,
      }))

      await db.insert(columnsTable).values(columnsData)
    }

    // 更新索引定义
    if (input.indexes) {
      await db.delete(indexesTable)
        .where(eq(indexesTable.tableId, input.id))

      const indexesData = input.indexes.map((idx) => ({
        tableId: input.id,
        name: idx.name,
        columns: JSON.stringify(idx.columns),
        isUnique: idx.isUnique ? 1 : 0,
        comment: idx.comment || null,
        createdAt: now,
        updatedAt: now,
      }))

      await db.insert(indexesTable).values(indexesData)
    }

    // 记录历史快照
    const snapshot = {
      table: updatedTable[0],
      columns: input.columns || oldColumns,
      indexes: input.indexes || oldIndexes,
    }

    await db.insert(tableHistoryTable).values({
      tableId: input.id,
      changeType: 'update',
      changeSummary: `更新表 ${updatedTable[0].name}`,
      sqlStatements: JSON.stringify([]),
      snapshot: JSON.stringify(snapshot),
      createdAt: now,
    })

    return updatedTable[0]
  })
```

**更新策略:**
- 保存旧数据用于历史记录
- 删除旧列和索引
- 插入新列和索引
- 创建历史快照
- 简化版本控制复杂度

#### 获取表详情
```typescript
getTableWithDetails: publicProcedure
  .input(schemartInputSchema.getTable)
  .query(async ({ input }) => {
    const table = await db
      .select()
      .from(tablesTable)
      .where(eq(tablesTable.id, input.id))
      .limit(1)

    const columns = await db
      .select()
      .from(columnsTable)
      .where(eq(columnsTable.tableId, input.id))
      .orderBy(columnsTable.orderIndex)

    const indexes = await db
      .select()
      .from(indexesTable)
      .where(eq(indexesTable.tableId, input.id))

    return {
      ...table[0],
      columns: columns.map(col => ({
        ...col,
        isNullable: !!col.isNullable,
        isPrimaryKey: !!col.isPrimaryKey,
        isAutoIncrement: !!col.isAutoIncrement,
        isUnique: !!col.isUnique,
        isBasicField: !!col.isBasicField,
      })),
      indexes: indexes.map(idx => ({
        ...idx,
        columns: JSON.parse(idx.columns),
        isUnique: !!idx.isUnique,
      }))
    }
  })
```

**查询优化:**
- 分别查询表、列、索引
- 按 orderIndex 排序列
- 类型转换: 整数 → 布尔值
- JSON 解析索引列数组

### 列管理

#### 基本字段保护
```typescript
// 前端编辑逻辑
const handleDeleteColumn = (index: number) => {
  if (columns[index].isBasicField) {
    alert('基本字段（id、created_at、updated_at）不能删除')
    return
  }
  setColumns(columns.filter((_, i) => i !== index))
}

const handleEditColumn = (index: number, field: string, value: any) => {
  if (columns[index].isBasicField && field === 'name') {
    alert('基本字段名称不能修改')
    return
  }
  // 允许修改其他属性
}
```

**保护策略:**
- id、created_at、updated_at 标记为基本字段
- 禁止删除基本字段
- 禁止修改基本字段名称
- 允许修改字段类型和约束

#### 字段排序
```typescript
// 拖拽排序逻辑 (可选功能)
const handleReorder = (startIndex: number, endIndex: number) => {
  const result = Array.from(columns)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  // 更新 orderIndex
  const reorderedColumns = result.map((col, index) => ({
    ...col,
    orderIndex: index
  }))

  setColumns(reorderedColumns)
}
```

### 索引管理

#### 复合索引处理
```typescript
// 索引列数组
indexes: [
  {
    name: 'idx_user_email',
    columns: ['email'],
    isUnique: true
  },
  {
    name: 'idx_user_status_created',
    columns: ['status', 'created_at'],
    isUnique: false
  }
]

// JSON 存储
columns: JSON.stringify(idx.columns)

// JSON 解析
columns: JSON.parse(idx.columns)
```

## 3. Relevant Code Modules

### 核心路由
- `src/server/routers/schemart.ts` - 核心 CRUD 路由实现
- `src/lib/schema/schemart.ts` - 数据验证 schema

### 前端页面
- `src/app/(pages)/project/[id]/page.tsx` - 项目详情和表列表
- `src/app/(pages)/table/[id]/page.tsx` - 表详情展示
- `src/app/(pages)/table/[id]/edit/page.tsx` - 表编辑功能

### 数据库
- `src/db/schema/schemart.ts` - 数据表结构定义
- `src/db/db.ts` - 数据库连接管理

## 4. Attention

- 表更新采用删除重建策略,高并发场景下需要事务隔离
- 布尔值使用整数存储（0/1）,前后端需要类型转换
- 基本字段保护在前端实现,后端也应该验证
- 级联删除要按正确顺序,避免外键约束错误
- 历史记录会快速增长,需要定期清理策略
- orderIndex 确保字段顺序,展示时必须排序
- JSON 字段（索引列）需要序列化和反序列化处理