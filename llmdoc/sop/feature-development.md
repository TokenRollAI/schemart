# 添加新功能开发流程

## 1. Purpose

标准化的新功能开发流程，基于现有模式和组件实现快速原型开发，确保代码一致性、类型安全和可维护性。

## 2. How it Works / Step-by-Step Guide

### 步骤 1: 需求分析和模式选择 (5 分钟)

1. **分析功能类型**
   - **AI Chat/Completion** → 参考 `src/app/(pages)/openai/page.tsx` + `src/server/routers/chat.ts`
   - **CRUD 操作** → 参考 `src/app/(pages)/trpc/page.tsx` + `src/server/routers/hello.ts`
   - **动画 UI** → 参考 `src/app/(pages)/magic/page.tsx` + `src/components/magicui/`

2. **确定数据需求**
   - 是否需要数据库存储
   - 是否需要 AI 集成
   - 是否需要复杂的用户交互

### 步骤 2: 创建页面路由 (3 分钟)

1. **创建页面目录**

   ```bash
   mkdir -p src/app/(pages)/your-feature
   ```

2. **复制并修改页面模板**

   ```bash
   # 根据功能类型复制对应模板
   # AI 功能复制 openai 模板
   cp src/app/(pages)/openai/page.tsx src/app/(pages)/your-feature/page.tsx
   # CRUD 功能复制 trpc 模板
   cp src/app/(pages)/trpc/page.tsx src/app/(pages)/your-feature/page.tsx
   # 动画UI复制 magic 模板
   cp src/app/(pages)/magic/page.tsx src/app/(pages)/your-feature/page.tsx
   ```

3. **修改页面内容**

   ```typescript
   // src/app/(pages)/your-feature/page.tsx
   import type { Metadata } from 'next'
   import { YourFeatureDemo } from '@/components/yourFeature/YourFeatureDemo'

   export const metadata: Metadata = {
     title: 'Your Feature | Fast MVP',
     description: '功能描述...',
   }

   export default function YourFeaturePage() {
     return (
       <div className='font-sans min-h-screen bg-background'>
         <main className='flex flex-col'>
           <div className='p-4 md:p-6'>
             <div className='max-w-6xl mx-auto'>
               <div className='mb-8 text-center'>
                 <h1 className='text-4xl font-bold tracking-tight mb-4'>
                   Your Feature Title
                 </h1>
                 <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                   功能描述...
                 </p>
               </div>
               <YourFeatureDemo />
             </div>
           </div>
         </main>
       </div>
     )
   }
   ```

### 步骤 3: 创建 tRPC 路由 (10 分钟)

1. **创建路由文件**

   ```bash
   touch src/server/routers/your-feature.ts
   ```

2. **实现路由逻辑**

   ```typescript
   // src/server/routers/your-feature.ts
   import { router, publicProcedure } from '../trpc'
   import { TRPCError } from '@trpc/server'
   import { yourFeatureInputSchema } from '@/lib/schema/your-feature'
   import { resolveLanguageModel } from '@/lib/ai/providers'
   import { generateText } from 'ai'
   import { db } from '@/db/db'
   import { eq } from 'drizzle-orm'

   export const yourFeatureRouter = router({
     // Query 示例 - 获取数据
     getData: publicProcedure
       .input(yourFeatureInputSchema.getData)
       .query(async ({ input }) => {
         const { id } = input
         // 从数据库获取数据
         const record = await db.query.yourTable.findFirst({
           where: eq(yourTable.id, id),
         })

         if (!record) {
           throw new TRPCError({
             code: 'NOT_FOUND',
             message: '记录不存在',
           })
         }

         return record
       }),

     // Mutation 示例 - 执行操作
     action: publicProcedure
       .input(yourFeatureInputSchema.action)
       .mutation(async ({ input }) => {
         try {
           // 如果需要 AI 功能
           if (input.provider && input.prompt) {
             const languageModel = resolveLanguageModel(
               input.provider,
               input.model,
             )
             const result = await generateText({
               model: languageModel,
               messages: [{ role: 'user', content: input.prompt }],
               temperature: 0.7,
             })
             return {
               success: true,
               response: result.text,
               usage: result.usage,
             }
           }

           // 数据库操作示例
           if (input.data) {
             const newRecord = await db
               .insert(yourTable)
               .values(input.data)
               .returning()

             return {
               success: true,
               data: newRecord[0],
               message: '操作完成',
             }
           }

           return { success: true, message: '操作完成' }
         } catch (error) {
           console.error('Operation failed:', error)
           throw new TRPCError({
             code: 'INTERNAL_SERVER_ERROR',
             message: error instanceof Error ? error.message : '操作失败',
             cause: error,
           })
         }
       }),

     // 列表查询示例
     getAll: publicProcedure.query(async () => {
       const records = await db.query.yourTable.findMany()
       return records
     }),
   })
   ```

### 步骤 4: 创建验证 Schema (5 分钟)

1. **创建验证文件**

   ```bash
   touch src/lib/schema/your-feature.ts
   ```

2. **定义验证规则**

   ```typescript
   // src/lib/schema/your-feature.ts
   import { z } from 'zod'

   export const yourFeatureInputSchema = {
     action: z.object({
       prompt: z.string().min(1, '输入不能为空'),
       provider: z.enum(['openai', 'claude', 'gemini']).default('openai'),
       model: z.string().optional(),
       data: z
         .object({
           // 根据实际数据结构定义字段
           name: z.string().min(1, '名称不能为空'),
           // 其他字段...
         })
         .optional(),
     }),
     getData: z.object({
       id: z.string().min(1, 'ID 不能为空'),
     }),
   }

   // 导出类型定义供客户端使用
   export type ActionInput = z.infer<typeof yourFeatureInputSchema.action>
   export type GetDataInput = z.infer<typeof yourFeatureInputSchema.getData>
   ```

### 步骤 5: 注册路由 (2 分钟)

1. **更新主路由文件**

   ```typescript
   // src/server/routers/_app.ts
   import { yourFeatureRouter } from './your-feature'

   export const appRouter = router({
     hello: helloRouter,
     chat: chatRouter,
     yourFeature: yourFeatureRouter, // 添加新路由
   })
   ```

### 步骤 6: 创建功能组件 (10 分钟)

1. **创建组件目录**

   ```bash
   mkdir -p src/components/yourFeature
   ```

2. **实现主要功能组件**

   ```typescript
   // src/components/yourFeature/YourFeatureDemo.tsx
   'use client'

   import { useState } from 'react'
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
   import { Button } from '@/components/ui/button'
   import { Input } from '@/components/ui/input'
   import { Label } from '@/components/ui/label'
   import { Badge } from '@/components/ui/badge'
   import { trpc } from '@/lib/trpc/client'

   export function YourFeatureDemo() {
     const [input, setInput] = useState('')
     const [selectedId, setSelectedId] = useState('')

     const utils = trpc.useUtils()

     // 使用 tRPC mutations
     const actionMutation = trpc.yourFeature.action.useMutation({
       onSuccess: () => {
         // 成功后刷新数据
         utils.yourFeature.getAll.invalidate()
         setInput('')
       },
       onError: (error) => {
         console.error('操作失败:', error)
       },
     })

     // 使用 tRPC queries
     const getDataQuery = trpc.yourFeature.getData.useQuery(
       { id: selectedId },
       {
         enabled: !!selectedId,
       }
     )

     const getAllQuery = trpc.yourFeature.getAll.useQuery()

     const handleSubmit = () => {
       if (!input.trim()) return

       actionMutation.mutate({
         prompt: input,
         provider: 'openai',
       })
     }

     return (
       <div className="max-w-6xl mx-auto p-6 space-y-6">
         {/* 主操作区域 */}
         <Card>
           <CardHeader>
             <CardTitle>Your Feature Demo</CardTitle>
             <CardDescription>功能演示和操作界面</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="input">输入内容</Label>
               <Input
                 id="input"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="请输入内容..."
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && input.trim()) {
                     handleSubmit()
                   }
                 }}
               />
             </div>

             <Button
               onClick={handleSubmit}
               disabled={actionMutation.isPending || !input.trim()}
               className="w-full"
             >
               {actionMutation.isPending ? '处理中...' : '提交'}
             </Button>

             {/* 显示结果 */}
             {actionMutation.data && (
               <Card className="border-primary/50 bg-primary/10">
                 <CardContent className="pt-4">
                   <div className="flex items-center gap-2">
                     <Badge variant="default">成功</Badge>
                     <span className="text-sm font-medium">
                       {actionMutation.data.message}
                     </span>
                   </div>
                   {actionMutation.data.response && (
                     <p className="text-sm text-muted-foreground mt-2">
                       {actionMutation.data.response}
                     </p>
                   )}
                 </CardContent>
               </Card>
             )}

             {/* 显示错误 */}
             {actionMutation.error && (
               <Card className="border-destructive/50 bg-destructive/10">
                 <CardContent className="pt-4">
                   <div className="flex items-center gap-2">
                     <Badge variant="destructive">错误</Badge>
                     <span className="text-sm font-medium">
                       {actionMutation.error.message}
                     </span>
                   </div>
                 </CardContent>
               </Card>
             )}
           </CardContent>
         </Card>

         {/* 数据列表区域 */}
         <Card>
           <CardHeader>
             <CardTitle>数据列表</CardTitle>
             <CardDescription>所有数据记录</CardDescription>
           </CardHeader>
           <CardContent>
             {getAllQuery.isLoading ? (
               <div className="flex items-center justify-center py-8">
                 <div className="text-sm text-muted-foreground">加载中...</div>
               </div>
             ) : getAllQuery.data && getAllQuery.data.length > 0 ? (
               <div className="space-y-2">
                 {getAllQuery.data.map((item) => (
                   <div
                     key={item.id}
                     className="flex items-center justify-between p-3 border rounded-lg"
                   >
                     <span>{item.name}</span>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => setSelectedId(item.id)}
                     >
                       查看详情
                     </Button>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-muted-foreground">
                 暂无数据
               </div>
             )}
           </CardContent>
         </Card>
       </div>
     )
   }
   ```

### 步骤 7: 更新主页导航 (3 分钟)

1. **更新主页内容**

   ```typescript
   // src/app/(pages)/page.tsx
   // 在 Features Section 添加新功能卡片，复制现有模式
   <motion.div
     initial={{ opacity: 0, x: 30 }}
     whileInView={{ opacity: 1, x: 0 }}
     transition={{ duration: 0.8 }}
     viewport={{ once: true }}
   >
     <Card className='relative overflow-hidden hover:shadow-warm-xl transition-all duration-500 group border-0 bg-gradient-to-br from-muted to-card'>
       <div className='absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500' />
       <CardHeader className='relative z-10'>
         <CardTitle className='flex items-center gap-3 text-2xl'>
           <div className='p-2 rounded-lg bg-gradient-primary'>
             <Sparkles className='w-6 h-6 text-white' />
           </div>
           Your Feature 演示
         </CardTitle>
         <CardDescription className='text-base'>
           功能描述和主要特性介绍
         </CardDescription>
       </CardHeader>
       <CardContent className='relative z-10'>
         <p className='text-muted-foreground mb-6 leading-relaxed'>
           详细描述功能特点和使用场景，让用户了解功能的价值。
         </p>
         <Link href='/your-feature'>
           <Button className='w-full bg-gradient-primary hover:shadow-warm text-white border-0 h-12 text-base group'>
             体验 Your Feature
             <ChevronRight className='ml-2 w-4 h-4 transition-transform group-hover:translate-x-1' />
           </Button>
         </Link>
       </CardContent>
     </Card>
   </motion.div>

   // 同时在 Hero Section 的 CTA 按钮区域添加新按钮
   <Link href='/your-feature'>
     <Button
       variant='outline'
       size='lg'
       className='h-12 px-6 text-base group'
     >
       查看 Your Feature 演示
       <ChevronRight className='ml-1 w-4 h-4 transition-transform group-hover:translate-x-1' />
     </Button>
   </Link>
   ```

### 步骤 8: 测试和验证 (2 分钟)

1. **启动开发服务器**

   ```bash
   pnpm dev
   ```

2. **功能测试**
   - 访问 `/your-feature` 页面
   - 测试所有交互功能
   - 验证错误处理
   - 检查响应式设计

## 3. Relevant Code Modules

### 3.1 页面路由

- `src/app/(pages)/your-feature/page.tsx` - 功能页面实现
- `src/app/(pages)/page.tsx` - 主页导航更新

### 3.2 服务端路由

- `src/server/routers/your-feature.ts` - tRPC 路由实现
- `src/server/routers/_app.ts` - 主路由聚合器
- `src/server/trpc.ts` - tRPC 配置和上下文

### 3.3 验证和类型

- `src/lib/schema/your-feature.ts` - 输入验证 schema 和类型定义
- `src/lib/trpc/client.ts` - tRPC 客户端配置
- `src/lib/trpc/server.ts` - tRPC 服务端配置

### 3.4 组件实现

- `src/components/yourFeature/YourFeatureDemo.tsx` - 主要功能组件
- `src/components/ui/` - shadcn/ui 基础组件库
- `src/components/magicui/` - MagicUI 动画组件库

### 3.5 参考模板

- `src/app/(pages)/openai/page.tsx` - AI 功能页面模板
- `src/app/(pages)/trpc/page.tsx` - CRUD 功能页面模板
- `src/app/(pages)/magic/page.tsx` - 动画 UI 页面模板
- `src/server/routers/chat.ts` - AI 路由实现参考
- `src/server/routers/hello.ts` - CRUD 路由实现参考
- `src/components/chat/OpenAIChatDemo.tsx` - AI 组件实现参考
- `src/components/helloDemo/HelloDemo.tsx` - CRUD 组件实现参考

## 4. Attention

- **复制现有模式**: 不要重新发明轮子，优先复制和修改现有代码，保持一致性
- **主题系统**: 严格使用主题类（如 `bg-gradient-primary`、`shadow-warm`），避免硬编码颜色
- **组件优先级**: 优先使用 shadcn/ui 组件，其次 MagicUI，最后自定义组件
- **错误处理**: 在 tRPC 路由中实现完整的错误处理，包含适当的 TRPCError 类型
- **数据刷新**: 使用 `utils.invalidate()` 在 mutation 成功后刷新相关查询数据
- **类型安全**: 确保所有数据流都有适当的 Zod schema 和 TypeScript 类型定义
- **响应式设计**: 所有组件都必须支持移动端适配，使用 Tailwind 响应式断点
- **加载状态**: 为异步操作提供加载状态（`isPending`）和用户反馈
- **动画效果**: 适当使用 Framer Motion 为页面和组件添加流畅的动画
- **代码结构**: 遵循现有的文件组织结构和命名规范
