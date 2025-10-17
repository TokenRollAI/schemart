import { router } from '../trpc'
import { helloRouter } from './hello'
import { chatRouter } from './chat'

/**
 * 这是tRPC的主路由
 * 所有的路由都在这里组合
 */
export const appRouter = router({
  hello: helloRouter,
  chat: chatRouter,
})

// 导出路由类型，供客户端使用
export type AppRouter = typeof appRouter
