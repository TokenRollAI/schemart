import { publicProcedure, router } from '../trpc'
import {
  db,
  projectsTable,
  tablesTable,
  columnsTable,
  indexesTable,
  tableHistoryTable,
} from '@/db/db'
import { eq, desc } from 'drizzle-orm'
import { schemartInputSchema } from '@/lib/schema/schemart'
import { TRPCError } from '@trpc/server'

// SQL生成工具函数
function generateCreateTableSQL(
  tableName: string,
  columns: Array<{
    name: string
    type: string
    comment: string
    isNullable: boolean
    isPrimaryKey: boolean
    isAutoIncrement: boolean
    isUnique: boolean
    defaultValue?: string | null
  }>,
  indexes: Array<{
    name: string
    columns: string[]
    isUnique: boolean
    comment?: string | null
  }>,
  databaseType: 'mysql' | 'postgresql' | 'sqlite',
): string {
  let sql = ''

  if (databaseType === 'mysql') {
    sql = `CREATE TABLE \`${tableName}\` (\n`
    const columnDefs = columns.map((col) => {
      let def = `  \`${col.name}\` ${col.type}`
      if (!col.isNullable) def += ' NOT NULL'
      if (col.isAutoIncrement) def += ' AUTO_INCREMENT'
      if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`
      if (col.isUnique && !col.isPrimaryKey) def += ' UNIQUE'
      def += ` COMMENT '${col.comment}'`
      return def
    })

    // 添加主键
    const primaryKeys = columns
      .filter((col) => col.isPrimaryKey)
      .map((col) => col.name)
    if (primaryKeys.length > 0) {
      columnDefs.push(`  PRIMARY KEY (\`${primaryKeys.join('`, `')}\`)`)
    }

    sql += columnDefs.join(',\n')
    sql +=
      '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;'

    // 添加索引
    indexes.forEach((idx) => {
      const uniqueStr = idx.isUnique ? 'UNIQUE ' : ''
      const commentStr = idx.comment ? ` COMMENT '${idx.comment}'` : ''
      sql += `\n\nCREATE ${uniqueStr}INDEX \`${idx.name}\` ON \`${tableName}\` (\`${idx.columns.join('`, `')}\`)${commentStr};`
    })
  } else if (databaseType === 'postgresql') {
    sql = `CREATE TABLE "${tableName}" (\n`
    const columnDefs = columns.map((col) => {
      let def = `  "${col.name}" ${col.type.replace('INT', 'INTEGER').replace('DATETIME', 'TIMESTAMP')}`
      if (!col.isNullable) def += ' NOT NULL'
      if (col.isAutoIncrement) def = `  "${col.name}" SERIAL`
      if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`
      if (col.isUnique && !col.isPrimaryKey) def += ' UNIQUE'
      return def
    })

    // 添加主键
    const primaryKeys = columns
      .filter((col) => col.isPrimaryKey)
      .map((col) => col.name)
    if (primaryKeys.length > 0) {
      columnDefs.push(`  PRIMARY KEY ("${primaryKeys.join('", "')}")`)
    }

    sql += columnDefs.join(',\n')
    sql += '\n);'

    // 添加注释
    columns.forEach((col) => {
      sql += `\nCOMMENT ON COLUMN "${tableName}"."${col.name}" IS '${col.comment}';`
    })

    // 添加索引
    indexes.forEach((idx) => {
      const uniqueStr = idx.isUnique ? 'UNIQUE ' : ''
      sql += `\n\nCREATE ${uniqueStr}INDEX "${idx.name}" ON "${tableName}" ("${idx.columns.join('", "')}");`
    })
  } else if (databaseType === 'sqlite') {
    sql = `CREATE TABLE "${tableName}" (\n`
    const columnDefs = columns.map((col) => {
      let def = `  "${col.name}" ${col.type}`
      if (col.isPrimaryKey && col.isAutoIncrement) {
        def = `  "${col.name}" INTEGER PRIMARY KEY AUTOINCREMENT`
      } else {
        if (!col.isNullable) def += ' NOT NULL'
        if (col.isPrimaryKey) def += ' PRIMARY KEY'
        if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`
        if (col.isUnique && !col.isPrimaryKey) def += ' UNIQUE'
      }
      return def
    })

    sql += columnDefs.join(',\n')
    sql += '\n);'

    // 添加索引
    indexes.forEach((idx) => {
      const uniqueStr = idx.isUnique ? 'UNIQUE ' : ''
      sql += `\n\nCREATE ${uniqueStr}INDEX "${idx.name}" ON "${tableName}" ("${idx.columns.join('", "')}");`
    })
  }

  return sql
}

export const schemartToolsRouter = router({
  // ==================== 生成SQL ====================
  generateSQLDiff: publicProcedure
    .input(schemartInputSchema.generateSQLDiff)
    .mutation(async ({ input }) => {
      // 获取表结构
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

      // 转换数据格式
      const formattedColumns = columns.map((col) => ({
        name: col.name,
        type: col.type,
        comment: col.comment,
        isNullable: col.isNullable === 1,
        isPrimaryKey: col.isPrimaryKey === 1,
        isAutoIncrement: col.isAutoIncrement === 1,
        isUnique: col.isUnique === 1,
        defaultValue: col.defaultValue,
      }))

      const formattedIndexes = indexes.map((idx) => ({
        name: idx.name,
        columns: JSON.parse(idx.columns),
        isUnique: idx.isUnique === 1,
        comment: idx.comment,
      }))

      // 生成CREATE TABLE SQL
      const createTableSQL = generateCreateTableSQL(
        table[0].name,
        formattedColumns,
        formattedIndexes,
        input.targetDatabaseType,
      )

      return {
        success: true,
        sql: createTableSQL,
        tableName: table[0].name,
        databaseType: input.targetDatabaseType,
      }
    }),

  // ==================== 导出项目 ====================
  exportProject: publicProcedure
    .input(schemartInputSchema.exportProject)
    .mutation(async ({ input }) => {
      // 获取项目信息
      const project = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, input.id))
        .limit(1)

      if (project.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '项目不存在',
        })
      }

      // 获取项目下的所有表
      const tables = await db
        .select()
        .from(tablesTable)
        .where(eq(tablesTable.projectId, input.id))

      // 获取所有表的列和索引
      const tablesWithDetails = await Promise.all(
        tables.map(async (table) => {
          const columns = await db
            .select()
            .from(columnsTable)
            .where(eq(columnsTable.tableId, table.id))
            .orderBy(columnsTable.orderIndex)

          const indexes = await db
            .select()
            .from(indexesTable)
            .where(eq(indexesTable.tableId, table.id))

          return {
            ...table,
            columns: columns.map((col) => ({
              ...col,
              isNullable: col.isNullable === 1,
              isPrimaryKey: col.isPrimaryKey === 1,
              isAutoIncrement: col.isAutoIncrement === 1,
              isUnique: col.isUnique === 1,
              isBasicField: col.isBasicField === 1,
            })),
            indexes: indexes.map((idx) => ({
              ...idx,
              columns: JSON.parse(idx.columns),
              isUnique: idx.isUnique === 1,
            })),
          }
        }),
      )

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        project: project[0],
        tables: tablesWithDetails,
      }

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2),
      }
    }),

  // ==================== 导入项目 ====================
  importProject: publicProcedure
    .input(schemartInputSchema.importProject)
    .mutation(async ({ input }) => {
      try {
        const importData = JSON.parse(input.data)
        const now = Math.floor(Date.now() / 1000)

        // 创建项目
        const newProject = await db
          .insert(projectsTable)
          .values({
            name: importData.project.name,
            description: importData.project.description,
            createdAt: now,
            updatedAt: now,
          })
          .returning()

        const newProjectId = newProject[0].id

        // 创建表
        for (const tableData of importData.tables) {
          const newTable = await db
            .insert(tablesTable)
            .values({
              projectId: newProjectId,
              name: tableData.name,
              comment: tableData.comment,
              createdAt: now,
              updatedAt: now,
            })
            .returning()

          const newTableId = newTable[0].id

          // 创建列
          if (tableData.columns && tableData.columns.length > 0) {
            const columnsData = tableData.columns.map(
              (col: {
                orderIndex: number
                name: string
                type: string
                comment: string
                isNullable: boolean
                isPrimaryKey: boolean
                isAutoIncrement: boolean
                isUnique: boolean
                defaultValue: string | null
                isBasicField: boolean
              }) => ({
                tableId: newTableId,
                name: col.name,
                type: col.type,
                comment: col.comment,
                isNullable: col.isNullable ? 1 : 0,
                isPrimaryKey: col.isPrimaryKey ? 1 : 0,
                isAutoIncrement: col.isAutoIncrement ? 1 : 0,
                isUnique: col.isUnique ? 1 : 0,
                defaultValue: col.defaultValue,
                isBasicField: col.isBasicField ? 1 : 0,
                orderIndex: col.orderIndex,
                createdAt: now,
                updatedAt: now,
              }),
            )

            await db.insert(columnsTable).values(columnsData)
          }

          // 创建索引
          if (tableData.indexes && tableData.indexes.length > 0) {
            const indexesData = tableData.indexes.map(
              (idx: {
                name: string
                columns: string[]
                isUnique: boolean
                comment: string | null
              }) => ({
                tableId: newTableId,
                name: idx.name,
                columns: JSON.stringify(idx.columns),
                isUnique: idx.isUnique ? 1 : 0,
                comment: idx.comment,
                createdAt: now,
                updatedAt: now,
              }),
            )

            await db.insert(indexesTable).values(indexesData)
          }
        }

        return {
          success: true,
          projectId: newProjectId,
          message: `成功导入项目: ${newProject[0].name}`,
        }
      } catch (error) {
        console.error('导入项目失败:', error)

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error ? error.message : '导入失败，数据格式错误',
          cause: error,
        })
      }
    }),
})
