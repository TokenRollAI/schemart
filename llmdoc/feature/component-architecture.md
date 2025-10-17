# 组件架构设计

## 1. Purpose

Fast MVP 采用简化的组件架构，基于 Radix UI Themes 和 Neo-Brutalism 设计系统，提供一致的视觉体验、高效的开发体验和高度可复用的组件体系。

## 2. How it Works

### 2.1 组件目录组织

**当前目录结构:**

```
src/components/
├── ui/                    # UI 组件库（简化版）
│   └── morphing-text.tsx  # 文字变形动画组件
├── providers/            # React Context 提供者
│   └── TrpcProvider.tsx
├── chat/                 # 聊天功能组件
│   └── OpenAIChatDemo.tsx
└── helloDemo/            # 演示组件
    └── HelloDemo.tsx
```

**架构特点:**

- **UI层**: 基于 Radix UI Themes 组件系统，通过 CSS 覆盖实现 Brutalist 风格
- **样式层**: Neo-Brutalism 设计系统，使用自定义 CSS 类和设计令牌
- **功能层**: 业务逻辑相关的复合组件，集成 tRPC 和状态管理
- **Provider层**: React Context 提供者，管理 tRPC 客户端和查询状态

### 2.2 Radix UI Themes 集成

**架构特点:**

- 组件基于 Radix UI Themes 构建，提供完整的组件库和主题系统
- 通过 CSS 覆盖实现 Neo-Brutalism 设计风格
- 使用主题令牌（Design Tokens）确保设计一致性
- 支持深色/浅色主题切换（当前固定为浅色）

**主题配置（layout.tsx）：**

```typescript
<Theme
  accentColor='orange'
  grayColor='sand'
  radius='large'
  appearance='light'
>
  {children}
</Theme>
```

**样式覆盖策略:**

```css
/* 覆盖 Radix UI 组件样式 */
.rt-Button {
  border: 3px solid var(--border-primary) !important;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.15) !important;
  border-radius: 12px !important;
}

.rt-Card {
  border: 3px solid var(--border-primary) !important;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.15) !important;
  border-radius: 20px !important;
}
```

**核心组件特点:**

- **Button**: 内置 hover/active 状态效果，支持多种颜色变体
- **Card**: 统一的卡片样式，带硬阴影效果
- **Input**: Brutalist 风格输入框，粗边框设计
- **Text**: 统一的文字样式系统
- **MorphingText**: 保留的文字变形动画组件，使用 SVG 滤镜

### 2.3 Neo-Brutalism 设计系统

**设计理念:**

- **粗犷边框**: 2-3px 黑色边框，无圆角或大圆角设计
- **硬阴影**: 无模糊的偏移阴影，创造立体感
- **大胆配色**: 鲜艳的对比色（粉、黄、蓝、绿）
- **几何形状**: 清晰的几何线条和形状
- **功能性优先**: 去除不必要的装饰元素

**CSS 类系统:**

```css
/* 核心组件类 */
.brutalist-container    /* 页面容器 */
.brutalist-card         /* 大卡片 */
.brutalist-card-sm      /* 小卡片 */
.brutalist-button       /* 按钮 */
.brutalist-input        /* 输入框 */
.brutalist-badge        /* 徽章 */
.brutalist-table        /* 表格 */
.brutalist-stat-card    /* 统计卡片 */
.brutalist-toggle       /* 开关 */

/* 颜色变体 */
.brutalist-button-pink
.brutalist-button-blue
.brutalist-button-green
.brutalist-badge-blue
.brutalist-badge-green
.brutalist-badge-yellow

/* 文字样式 */
.brutalist-title
.brutalist-heading
.brutalist-text
.brutalist-text-secondary
```

**设计令牌:**

- **颜色**: 使用 CSS 变量定义颜色系统（`--color-pink`, `--color-yellow` 等）
- **边框**: 统一的边框宽度（`--border-thick`, `--border-medium`）
- **阴影**: 硬阴影效果（`--shadow-lg`, `--shadow-md`）
- **圆角**: 标准化圆角尺寸（`--radius-xl`, `--radius-lg`）

**使用模式:**

```jsx
// 典型页面布局
<div className='brutalist-container'>
  <h1 className='brutalist-title'>标题</h1>
  <div className='brutalist-card p-8'>
    <h2 className='brutalist-heading'>子标题</h2>
    <p className='brutalist-text'>内容</p>
    <button className='brutalist-button brutalist-button-blue'>
      按钮
    </button>
  </div>
</div>
```

### 2.4 Provider 组件实现

**TRPCProvider 实际实现:**

```typescript
// src/components/providers/TrpcProvider.tsx - 实际代码
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
```

**关键设计特点:**

- **环境适配**: `getBaseUrl()` 函数处理浏览器和 SSR 环境的不同 URL
- **性能优化**: 针对 AI API 的特殊配置，减少不必要的请求和重试
- **客户端创建**: 使用 `trpc.createClient()` 而非 `createTRPCClient()`

### 2.5 功能组件设计模式

**HelloDemo 实际实现模式:**

```typescript
// 实际的状态管理
const [name, setName] = useState('')
const [selectedName, setSelectedName] = useState('')
const [searchQuery, setSearchQuery] = useState('')

// 实际的 tRPC 集成
const utils = trpc.useUtils()
const sayHelloMutation = trpc.hello.sayHello.useMutation({
  onSuccess: () => {
    utils.hello.getAll.invalidate() // 实时数据刷新
    setName('')
    if (selectedName === name.trim()) {
      setSelectedName('')
    }
  },
})

// 条件查询
const getCountQuery = trpc.hello.getCount.useQuery(
  { name: selectedName },
  { enabled: !!selectedName },
)

// 数据过滤和统计
const filteredRecords =
  getAllQuery.data?.filter((record) =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase()),
  ) || []
```

**OpenAIChatDemo 实际实现模式:**

```typescript
// 实际的消息类型定义
type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 实际的消息管理
const [messages, setMessages] = useState<Message[]>([])

// 实际的 mutation 集成
const sendMessageMutation = trpc.chat.sendMessage.useMutation({
  onSuccess: (data) => {
    const assistantMessage: Message = {
      id: Date.now().toString() + '-assistant',
      role: 'assistant',
      content: data.response,
    }
    setMessages((prev) => [...prev, assistantMessage])
  },
  onError: (error) => {
    console.error('发送消息失败:', error)
  },
})

// 实际的提交处理
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (!input.trim() || sendMessageMutation.isPending) return

  const messageText = input.trim()
  const userMessage: Message = {
    id: Date.now().toString() + '-user',
    role: 'user',
    content: messageText,
  }

  setMessages((prev) => [...prev, userMessage])
  sendMessageMutation.mutate({
    message: messageText,
    provider: 'openai',
    model: OPENAI_MODEL,
    conversationHistory: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  })
  setInput('')
}
```

## 3. Relevant Code Modules

### 3.1 基础 UI 组件

- `src/components/ui/morphing-text.tsx` - 文字变形动画组件，使用 SVG 滤镜和 requestAnimationFrame

### 3.2 样式系统文件

- `src/app/(pages)/globals.css` - 核心样式定义，包含 CSS 变量、Brutalist 类和 Radix UI 覆盖
- `tailwind.config.ts` - Tailwind CSS 配置，定义主题扩展和工具类
- `src/app/(pages)/layout.tsx` - 根布局，配置 Radix UI Theme 和字体

### 3.3 Provider 组件

- `src/components/providers/TrpcProvider.tsx` - tRPC 和 React Query 集成提供者，针对 AI API 优化配置

### 3.4 功能组件

- `src/components/chat/OpenAIChatDemo.tsx` - OpenAI 聊天演示，使用 Brutalist 样式系统，支持消息历史和实时对话
- `src/components/helloDemo/HelloDemo.tsx` - 完整 CRUD 演示，使用 Brutalist 样式，包含统计、搜索功能

### 3.5 页面实现示例

- `src/app/(pages)/page.tsx` - 首页，完整展示 Neo-Brutalism 设计系统应用
- `src/app/(pages)/openai/page.tsx` - AI 聊天页面，使用 Brutalist 容器和组件

### 3.6 依赖包配置

- **@radix-ui/themes**: 3.2.1 - 核心 UI 组件库和主题系统
- **@radix-ui/react-icons**: 1.3.2 - 图标库
- **framer-motion**: 12.23.12 - 动画库（用于 MorphingText）
- **tailwindcss**: 4 - CSS 框架，提供工具类支持

## 4. Attention

- **组件简化**: 项目已简化组件架构，移除了 shadcn/ui 和 MagicUI，改用 Radix UI Themes
- **设计系统**: 所有组件必须遵循 Neo-Brutalism 设计规范，使用预定义的 Brutalist CSS 类
- **样式一致性**: 避免硬编码样式值，优先使用设计令牌和预定义类
- **性能考虑**: MorphingText 组件使用 SVG 滤镜，在低端设备可能需要性能优化
- **主题集成**: 新组件需要考虑与 Radix UI Themes 的集成和样式覆盖
- **响应式设计**: 结合 Tailwind 的响应式类使用 Brutalist 组件
- **无障碍访问**: Radix UI Themes 提供基础的无障碍访问支持
- **开发效率**: 简化的组件架构提高了开发效率，减少了维护成本
