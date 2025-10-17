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

export const schemartRouter = router({
  // ==================== Project CRUD ====================
  createProject: publicProcedure
    .input(schemartInputSchema.createProject)
    .mutation(async ({ input }) => {
      const now = Math.floor(Date.now() / 1000)
      const newProject = await db
        .insert(projectsTable)
        .values({
          name: input.name,
          description: input.description || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning()

      return newProject[0]
    }),

  updateProject: publicProcedure
    .input(schemartInputSchema.updateProject)
    .mutation(async ({ input }) => {
      const now = Math.floor(Date.now() / 1000)
      const updated = await db
        .update(projectsTable)
        .set({
          name: input.name,
          description: input.description,
          updatedAt: now,
        })
        .where(eq(projectsTable.id, input.id))
        .returning()

      if (updated.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '项目不存在',
        })
      }

      return updated[0]
    }),

  deleteProject: publicProcedure
    .input(schemartInputSchema.deleteProject)
    .mutation(async ({ input }) => {
      // 先删除项目下的所有表（级联删除）
      const tables = await db
        .select()
        .from(tablesTable)
        .where(eq(tablesTable.projectId, input.id))

      for (const table of tables) {
        // 删除列
        await db.delete(columnsTable).where(eq(columnsTable.tableId, table.id))
        // 删除索引
        await db.delete(indexesTable).where(eq(indexesTable.tableId, table.id))
        // 删除历史记录
        await db
          .delete(tableHistoryTable)
          .where(eq(tableHistoryTable.tableId, table.id))
      }

      // 删除表
      await db.delete(tablesTable).where(eq(tablesTable.projectId, input.id))

      // 删除项目
      await db.delete(projectsTable).where(eq(projectsTable.id, input.id))

      return { success: true }
    }),

  getProject: publicProcedure
    .input(schemartInputSchema.getProject)
    .query(async ({ input }) => {
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

      return {
        ...project[0],
        tables,
      }
    }),

  getAllProjects: publicProcedure
    .input(schemartInputSchema.getAllProjects)
    .query(async () => {
      const projects = await db
        .select()
        .from(projectsTable)
        .orderBy(desc(projectsTable.updatedAt))

      // 为每个项目获取表数量
      const projectsWithTableCount = await Promise.all(
        projects.map(async (project) => {
          const tables = await db
            .select()
            .from(tablesTable)
            .where(eq(tablesTable.projectId, project.id))

          return {
            ...project,
            tableCount: tables.length,
          }
        }),
      )

      return projectsWithTableCount
    }),

  // ==================== Table CRUD ====================
  createTable: publicProcedure
    .input(schemartInputSchema.createTable)
    .mutation(async ({ input }) => {
      const now = Math.floor(Date.now() / 1000)

      // 创建表
      const newTable = await db
        .insert(tablesTable)
        .values({
          projectId: input.projectId,
          name: input.name,
          comment: input.comment || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning()

      const tableId = newTable[0].id

      // 创建列
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

      // 创建索引
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

      // 记录历史
      const snapshot = {
        table: newTable[0],
        columns: input.columns,
        indexes: input.indexes,
      }

      await db.insert(tableHistoryTable).values({
        tableId,
        changeType: 'create',
        changeSummary: `创建表 ${input.name}`,
        sqlStatements: JSON.stringify([]),
        snapshot: JSON.stringify(snapshot),
        createdAt: now,
      })

      return newTable[0]
    }),

  updateTable: publicProcedure
    .input(schemartInputSchema.updateTable)
    .mutation(async ({ input }) => {
      const now = Math.floor(Date.now() / 1000)

      // 获取旧的表结构
      const oldTable = await db
        .select()
        .from(tablesTable)
        .where(eq(tablesTable.id, input.id))
        .limit(1)

      if (oldTable.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '表不存在',
        })
      }

      const oldColumns = await db
        .select()
        .from(columnsTable)
        .where(eq(columnsTable.tableId, input.id))

      const oldIndexes = await db
        .select()
        .from(indexesTable)
        .where(eq(indexesTable.tableId, input.id))

      // 更新表信息
      const updateData: {
        name?: string
        comment?: string | null
        updatedAt: number
      } = { updatedAt: now }

      if (input.name) updateData.name = input.name
      if (input.comment !== undefined)
        updateData.comment = input.comment || null

      const updatedTable = await db
        .update(tablesTable)
        .set(updateData)
        .where(eq(tablesTable.id, input.id))
        .returning()

      // 如果有新的列定义，删除旧列并创建新列
      if (input.columns) {
        await db.delete(columnsTable).where(eq(columnsTable.tableId, input.id))

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

      // 如果有新的索引定义，删除旧索引并创建新索引
      if (input.indexes) {
        await db.delete(indexesTable).where(eq(indexesTable.tableId, input.id))

        if (input.indexes.length > 0) {
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
      }

      // 记录历史
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
    }),

  deleteTable: publicProcedure
    .input(schemartInputSchema.deleteTable)
    .mutation(async ({ input }) => {
      // 删除列
      await db.delete(columnsTable).where(eq(columnsTable.tableId, input.id))
      // 删除索引
      await db.delete(indexesTable).where(eq(indexesTable.tableId, input.id))
      // 删除历史记录
      await db
        .delete(tableHistoryTable)
        .where(eq(tableHistoryTable.tableId, input.id))
      // 删除表
      await db.delete(tablesTable).where(eq(tablesTable.id, input.id))

      return { success: true }
    }),

  getTable: publicProcedure
    .input(schemartInputSchema.getTable)
    .query(async ({ input }) => {
      const table = await db
        .select()
        .from(tablesTable)
        .where(eq(tablesTable.id, input.id))
        .limit(1)

      if (table.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '表不存在',
        })
      }

      // 获取列
      const columns = await db
        .select()
        .from(columnsTable)
        .where(eq(columnsTable.tableId, input.id))
        .orderBy(columnsTable.orderIndex)

      // 获取索引
      const indexes = await db
        .select()
        .from(indexesTable)
        .where(eq(indexesTable.tableId, input.id))

      // 转换列数据
      const formattedColumns = columns.map((col) => ({
        ...col,
        isNullable: col.isNullable === 1,
        isPrimaryKey: col.isPrimaryKey === 1,
        isAutoIncrement: col.isAutoIncrement === 1,
        isUnique: col.isUnique === 1,
        isBasicField: col.isBasicField === 1,
      }))

      // 转换索引数据
      const formattedIndexes = indexes.map((idx) => ({
        ...idx,
        columns: JSON.parse(idx.columns),
        isUnique: idx.isUnique === 1,
      }))

      return {
        ...table[0],
        columns: formattedColumns,
        indexes: formattedIndexes,
      }
    }),

  getTablesByProject: publicProcedure
    .input(schemartInputSchema.getTablesByProject)
    .query(async ({ input }) => {
      const tables = await db
        .select()
        .from(tablesTable)
        .where(eq(tablesTable.projectId, input.projectId))
        .orderBy(desc(tablesTable.updatedAt))

      return tables
    }),

  // ==================== 表历史记录 ====================
  getTableHistory: publicProcedure
    .input(schemartInputSchema.getTableHistory)
    .query(async ({ input }) => {
      const history = await db
        .select()
        .from(tableHistoryTable)
        .where(eq(tableHistoryTable.tableId, input.tableId))
        .orderBy(desc(tableHistoryTable.createdAt))

      return history.map((h) => ({
        ...h,
        sqlStatements: JSON.parse(h.sqlStatements),
        snapshot: JSON.parse(h.snapshot),
      }))
    }),
})
