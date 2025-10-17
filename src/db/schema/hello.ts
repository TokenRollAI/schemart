import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const helloTable = sqliteTable('hello', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  count: int().notNull().default(0),
})
