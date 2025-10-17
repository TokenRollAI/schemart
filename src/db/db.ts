import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { helloTable } from './schema/hello'
import { env } from '@/lib/env'

/**
 * 数据库连接单例
 * 确保整个应用只创建一个数据库连接实例
 */
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

/**
 * @deprecated 使用 getDb() 替代直接导入 db
 * 为了向后兼容保留此导出，但建议使用函数形式
 */
export const db = getDb()

export { helloTable }
