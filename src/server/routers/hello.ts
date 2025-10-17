import { publicProcedure, router } from '../trpc'
import { db, helloTable } from '@/db/db'
import { eq } from 'drizzle-orm'
import { helloInputSchema } from '@/lib/schema/hello'

export const helloRouter = router({
  sayHello: publicProcedure
    .input(helloInputSchema.sayHello)
    .mutation(async ({ input }) => {
      const { name } = input

      const existingRecord = await db
        .select()
        .from(helloTable)
        .where(eq(helloTable.name, name))
        .limit(1)

      if (existingRecord.length > 0) {
        // 更新count
        const updatedRecord = await db
          .update(helloTable)
          .set({ count: existingRecord[0].count + 1 })
          .where(eq(helloTable.name, name))
          .returning()

        return {
          ...updatedRecord[0],
          message: `Hello ${name}! Count updated to ${updatedRecord[0].count}`,
        }
      } else {
        // 创建新记录
        const newRecord = await db
          .insert(helloTable)
          .values({ name, count: 1 })
          .returning()

        return {
          ...newRecord[0],
          message: `Hello ${name}! First time greeting, count is now 1`,
        }
      }
    }),

  getCount: publicProcedure
    .input(helloInputSchema.getCount)
    .query(async ({ input }) => {
      const { name } = input
      const record = await db
        .select()
        .from(helloTable)
        .where(eq(helloTable.name, name))
        .limit(1)

      if (record.length === 0) {
        return {
          id: null,
          name,
          count: 0,
          message: `No greetings found for ${name}`,
        }
      }

      return {
        ...record[0],
        message: `${name} has been greeted ${record[0].count} times`,
      }
    }),

  getAll: publicProcedure.query(async () => {
    const records = await db.select().from(helloTable)
    return records
  }),
})
