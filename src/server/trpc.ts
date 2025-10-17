import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

/**
 * 初始化tRPC后端
 * 使用superjson支持Date/Map/Set等复杂类型的序列化
 */
const t = initTRPC.create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * 创建路由
 */
export const router = t.router

/**
 * 公开的procedure
 */
export const publicProcedure = t.procedure
