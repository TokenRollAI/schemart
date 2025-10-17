'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import superjson from 'superjson'

function getBaseUrl() {
  // 浏览器环境
  if (typeof window !== 'undefined') {
    return ''
  }
  // SSR环境
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // AI 响应不频繁变化，增加 staleTime 减少不必要的请求
            staleTime: 60 * 1000, // 1 分钟
            // AI API 调用成本高，失败后减少重试次数
            retry: 1,
            // 失败后不立即重试，避免浪费配额
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 5000),
          },
          mutations: {
            // mutation 失败后不自动重试，由用户决定
            retry: false,
          },
        },
      }),
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
