import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { drizzle } from 'drizzle-orm/libsql'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { helloTable } from './schema/hello'
import {
  projectsTable,
  tablesTable,
  columnsTable,
  indexesTable,
  conversationHistoryTable,
  tableHistoryTable,
} from './schema/schemart'
import { env } from '@/lib/env'

/**
 * 数据库连接单例
 * 确保整个应用只创建一个数据库连接实例
 */
let _db: LibSQLDatabase | null = null

const ensureDatabaseFile = (dbUrl: string) => {
  if (!dbUrl.startsWith('file:')) {
    return
  }

  const [rawPath] = dbUrl.replace(/^file:/, '').split('?')
  if (!rawPath) {
    return
  }

  const resolvedPath = path.isAbsolute(rawPath)
    ? rawPath
    : path.resolve(process.cwd(), rawPath)

  const directory = path.dirname(resolvedPath)
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }

  if (!fs.existsSync(resolvedPath)) {
    fs.closeSync(fs.openSync(resolvedPath, 'w'))
  }
}

export const getDb = (): LibSQLDatabase => {
  if (!_db) {
    ensureDatabaseFile(env.DB_FILE_NAME)
    _db = drizzle({
      connection: {
        url: env.DB_FILE_NAME,
      },
    })
  }
  return _db
}

/**
 * @deprecated 使用 getDb() 替代直接导入 db
 * 为了向后兼容保留此导出，但建议使用函数形式
 */
export const db = getDb()

export {
  helloTable,
  projectsTable,
  tablesTable,
  columnsTable,
  indexesTable,
  conversationHistoryTable,
  tableHistoryTable,
}
