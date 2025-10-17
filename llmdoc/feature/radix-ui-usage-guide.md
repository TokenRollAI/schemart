# Radix UI 使用指南

本文档详细说明了 Fast MVP 项目中 Radix UI Themes 的使用方法、最佳实践和常见组件示例。

## 目录

- [简介](#简介)
- [安装配置](#安装配置)
- [核心概念](#核心概念)
- [常用组件](#常用组件)
- [图标系统](#图标系统)
- [主题定制](#主题定制)
- [最佳实践](#最佳实践)

---

## 简介

项目已从 shadcn/ui + MagicUI 完全迁移到 **Radix UI Themes 3.2.1**。Radix UI Themes 提供了：

- **完整的样式化组件库** - 开箱即用的美观组件
- **强大的主题系统** - 支持深色模式和自定义配置
- **完整的可访问性** - 遵循 ARIA 标准
- **TypeScript 优先** - 完整的类型支持
- **与 Tailwind CSS 兼容** - 可以混合使用

## 安装配置

### 依赖包

```json
{
  "dependencies": {
    "@radix-ui/themes": "^3.2.1",
    "@radix-ui/react-icons": "^1.3.2"
  }
}
```

### 根布局配置

`src/app/(pages)/layout.tsx`:

```tsx
import '@radix-ui/themes/styles.css'
import { Theme } from '@radix-ui/themes'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <Theme
          accentColor='orange' // 主色调：橙色 (#ba7123)
          grayColor='sand' // 灰色调：沙色
          radius='medium' // 圆角：中等
          appearance='dark' // 外观：深色模式
        >
          {children}
        </Theme>
      </body>
    </html>
  )
}
```

### 全局样式集成

`src/app/(pages)/globals.css`:

```css
@import 'tailwindcss';

:root {
  /* 基于深色调渐变的统一主题配色 - 与 Radix UI 集成 */
  --background: #001014;
  --foreground: #f0f0f0;

  /* 自定义渐变色变量 */
  --gradient-primary: linear-gradient(135deg, #ba7123 0%, #523737 100%);
  --gradient-warm: linear-gradient(
    135deg,
    #ba7123 0%,
    #a89e4b 50%,
    #f0f0f0 100%
  );
  /* ... 更多渐变定义 */
}
```

---

## 核心概念

### Props 系统

Radix UI Themes 使用统一的 props 系统：

```tsx
<Button
  size='3' // 尺寸: "1" | "2" | "3" | "4"
  variant='solid' // 变体: "solid" | "soft" | "outline" | "ghost"
  color='orange' // 颜色: "orange" | "gray" | "red" 等
  radius='medium' // 圆角: "none" | "small" | "medium" | "large" | "full"
  highContrast // 高对比度模式
>
  点击我
</Button>
```

### 响应式设计

使用响应式 props：

```tsx
<Box
  p={{ initial: '2', md: '4', lg: '6' }} // padding 响应式
  display={{ initial: 'block', md: 'flex' }} // display 响应式
>
  内容
</Box>
```

### 布局组件

```tsx
import { Flex, Box, Grid, Container, Section } from '@radix-ui/themes'

// Flex 布局
<Flex direction='column' gap='4' align='center'>
  <Box>项目 1</Box>
  <Box>项目 2</Box>
</Flex>

// Grid 布局
<Grid columns='3' gap='4'>
  <Box>网格项 1</Box>
  <Box>网格项 2</Box>
  <Box>网格项 3</Box>
</Grid>
```

---

## 常用组件

### Button（按钮）

```tsx
import { Button } from '@radix-ui/themes'

// 基础用法
<Button size='3' variant='solid'>主要操作</Button>
<Button size='3' variant='soft' color='gray'>次要操作</Button>
<Button size='3' variant='outline'>轮廓按钮</Button>
<Button size='3' variant='ghost'>幽灵按钮</Button>

// 禁用状态
<Button disabled>禁用按钮</Button>

// 加载状态
<Button loading>加载中...</Button>
```

**迁移对比：**

```tsx
// 旧的 shadcn/ui 写法
<Button variant="default" size="lg">点击</Button>

// 新的 Radix UI Themes 写法
<Button size="3" variant="solid">点击</Button>
```

### Card（卡片）

```tsx
import { Card, Heading, Text } from '@radix-ui/themes'
;<Card size='3'>
  <Heading size='5' mb='2'>
    卡片标题
  </Heading>
  <Text size='2'>卡片内容描述</Text>
</Card>
```

**迁移对比：**

```tsx
// 旧的 shadcn/ui 写法
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>内容</CardContent>
</Card>

// 新的 Radix UI Themes 写法
<Card>
  <Heading size='5' mb='2'>标题</Heading>
  <Text>内容</Text>
</Card>
```

### TextField（输入框）

```tsx
import { TextField } from '@radix-ui/themes'

<TextField.Root
  size='3'
  placeholder='请输入内容'
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// 带图标的输入框
<TextField.Root size='3'>
  <TextField.Slot>
    <MagnifyingGlassIcon width={16} height={16} />
  </TextField.Slot>
  <TextField.Input placeholder='搜索...' />
</TextField.Root>
```

### Badge（徽章）

```tsx
import { Badge } from '@radix-ui/themes'

<Badge color='orange'>主要</Badge>
<Badge color='gray'>次要</Badge>
<Badge color='green'>成功</Badge>
<Badge color='red'>错误</Badge>
```

### Table（表格）

```tsx
import { Table } from '@radix-ui/themes'
;<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>名称</Table.ColumnHeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>1</Table.Cell>
      <Table.Cell>项目 A</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

### Dialog（对话框）

```tsx
import { Dialog, Button, Flex, Text } from '@radix-ui/themes'
;<Dialog.Root>
  <Dialog.Trigger>
    <Button>打开对话框</Button>
  </Dialog.Trigger>

  <Dialog.Content maxWidth='450px'>
    <Dialog.Title>对话框标题</Dialog.Title>
    <Dialog.Description size='2' mb='4'>
      这是对话框的描述文本
    </Dialog.Description>

    <Flex gap='3' mt='4' justify='end'>
      <Dialog.Close>
        <Button variant='soft' color='gray'>
          取消
        </Button>
      </Dialog.Close>
      <Button>确认</Button>
    </Flex>
  </Dialog.Content>
</Dialog.Root>
```

### Select（下拉选择）

```tsx
import { Select } from '@radix-ui/themes'
;<Select.Root defaultValue='apple'>
  <Select.Trigger />
  <Select.Content>
    <Select.Group>
      <Select.Label>水果</Select.Label>
      <Select.Item value='apple'>苹果</Select.Item>
      <Select.Item value='banana'>香蕉</Select.Item>
      <Select.Item value='orange'>橙子</Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>
```

---

## 图标系统

### Radix Icons

项目使用 `@radix-ui/react-icons`，包含 300+ 精美图标。

```tsx
import {
  ChevronRightIcon,
  StarIcon,
  LightningBoltIcon,
  CodeIcon,
  ChatBubbleIcon,
} from '@radix-ui/react-icons'

// 基础用法
<ChevronRightIcon width={16} height={16} />
<StarIcon width={20} height={20} className='text-yellow-500' />

// 在按钮中使用
<Button>
  <CodeIcon width={16} height={16} />
  查看代码
</Button>
```

### 常用图标映射

从 lucide-react 迁移到 @radix-ui/react-icons：

| lucide-react    | @radix-ui/react-icons | 说明           |
| --------------- | --------------------- | -------------- |
| `ChevronRight`  | `ChevronRightIcon`    | 右箭头         |
| `Sparkles`      | `StarIcon`            | 星星           |
| `Zap`           | `LightningBoltIcon`   | 闪电           |
| `Shield`        | `LockClosedIcon`      | 锁（替代盾牌） |
| `Palette`       | `ColorWheelIcon`      | 调色板         |
| `Code`          | `CodeIcon`            | 代码           |
| `MessageCircle` | `ChatBubbleIcon`      | 聊天气泡       |

### 图标尺寸规范

```tsx
// 小图标 - 用于文本内联
<Icon width={14} height={14} />

// 标准图标 - 用于按钮和列表
<Icon width={16} height={16} />

// 大图标 - 用于标题和重点展示
<Icon width={20} height={20} />

// 特大图标 - 用于空状态和图标按钮
<Icon width={24} height={24} />
```

---

## 主题定制

### 颜色系统

Radix UI Themes 支持的颜色：

```tsx
// Accent 颜色（主色调）
;'tomato' |
  'red' |
  'ruby' |
  'crimson' |
  'pink' |
  'plum' |
  'purple' |
  'violet' |
  'iris' |
  'indigo' |
  'blue' |
  'cyan' |
  'teal' |
  'jade' |
  'green' |
  'grass' |
  'brown' |
  'orange' |
  'sky' |
  'mint' |
  'lime' |
  'yellow' |
  'amber' |
  'gold' |
  'bronze' |
  'gray'

// 项目使用：
accentColor = 'orange' // #ba7123
grayColor = 'sand' // 温暖的灰色调
```

### 自定义 CSS 变量

可以覆盖 Radix UI 的 CSS 变量：

```css
:root,
.dark,
.dark-theme {
  /* 覆盖 Radix UI 的颜色变量 */
  --accent-9: #ba7123; /* 主色调 */
  --accent-10: #a89e4b; /* 主色调浅色 */

  /* 自定义渐变 */
  --gradient-primary: linear-gradient(135deg, #ba7123 0%, #523737 100%);
}
```

### 与自定义样式结合

```tsx
<Button
  size='3'
  className='bg-gradient-primary shadow-warm'  // 使用自定义 Tailwind 类
>
  渐变按钮
</Button>

<Card className='glow-primary'>
  <Heading className='text-gradient-warm'>
    渐变文字标题
  </Heading>
</Card>
```

---

## 最佳实践

### 1. 组件组合优于创建新组件

```tsx
// ✅ 推荐：直接组合使用
;<Flex direction='column' gap='4'>
  <Heading size='6'>标题</Heading>
  <Text size='3'>描述文本</Text>
  <Button size='3'>操作</Button>
</Flex>

// ❌ 避免：不必要的封装
const MyCustomCard = () => <div className='custom-card'>...</div>
```

### 2. 使用语义化的颜色 Props

```tsx
// ✅ 推荐：使用 color prop
<Badge color='green'>成功</Badge>
<Badge color='red'>错误</Badge>

// ❌ 避免：硬编码颜色类
<Badge className='bg-green-500'>成功</Badge>
```

### 3. 响应式优先

```tsx
// ✅ 推荐：使用响应式 props
<Flex
  direction={{ initial: 'column', md: 'row' }}
  gap={{ initial: '2', md: '4' }}
>
  内容
</Flex>

// ❌ 避免：使用 Tailwind 响应式类
<div className='flex flex-col md:flex-row gap-2 md:gap-4'>
  内容
</div>
```

### 4. 保持一致的尺寸体系

```tsx
// 尺寸对应关系
size="1" → 最小 (text: 12px, button: 24px)
size="2" → 小   (text: 14px, button: 32px)
size="3" → 中   (text: 16px, button: 40px) ← 推荐默认
size="4" → 大   (text: 18px, button: 48px)

// ✅ 推荐：统一使用 size="3"
<Button size='3'>按钮</Button>
<TextField.Root size='3' />
<Badge size='2'>徽章</Badge>
```

### 5. 与 Framer Motion 结合

```tsx
import { Button } from '@radix-ui/themes'
import { motion } from 'framer-motion'

const MotionButton = motion(Button)

<MotionButton
  size='3'
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  动画按钮
</MotionButton>
```

### 6. 类型安全

```tsx
import type { ButtonProps } from '@radix-ui/themes'

interface MyButtonProps extends ButtonProps {
  customProp?: string
}

function MyButton({ customProp, ...props }: MyButtonProps) {
  return <Button {...props}>按钮</Button>
}
```

---

## 常见模式

### 表单布局

```tsx
<Flex direction='column' gap='4' maxWidth='400px'>
  <label>
    <Text as='div' size='2' mb='1' weight='bold'>
      用户名
    </Text>
    <TextField.Root size='3' placeholder='请输入用户名' />
  </label>

  <label>
    <Text as='div' size='2' mb='1' weight='bold'>
      密码
    </Text>
    <TextField.Root size='3' type='password' placeholder='请输入密码' />
  </label>

  <Button size='3'>提交</Button>
</Flex>
```

### 加载状态

```tsx
const [isLoading, setIsLoading] = useState(false)

<Button
  size='3'
  loading={isLoading}
  onClick={() => setIsLoading(true)}
>
  {isLoading ? '加载中...' : '点击加载'}
</Button>
```

### 空状态

```tsx
<Flex direction='column' align='center' gap='4' py='8'>
  <Box className='text-gray-400'>
    <InboxIcon width={48} height={48} />
  </Box>
  <Heading size='4' color='gray'>
    暂无数据
  </Heading>
  <Text size='2' color='gray'>
    开始创建你的第一个项目
  </Text>
  <Button size='3'>创建项目</Button>
</Flex>
```

---

## 相关资源

- **官方文档**: https://www.radix-ui.com/themes/docs
- **组件示例**: https://www.radix-ui.com/themes/playground
- **图标库**: https://www.radix-ui.com/icons
- **GitHub**: https://github.com/radix-ui/themes

---

## 迁移总结

### 已移除的依赖

- `@radix-ui/react-label` → 使用 `<Text as="label">`
- `@radix-ui/react-slot` → Radix UI Themes 内置
- `class-variance-authority` → 使用 Radix UI 的 variant 系统
- `lucide-react` → 使用 `@radix-ui/react-icons`
- `tailwindcss-animate` → Framer Motion 提供动画
- `shadcn` CLI → 不再需要

### 当前依赖

```json
{
  "@radix-ui/themes": "^3.2.1",
  "@radix-ui/react-icons": "^1.3.2",
  "framer-motion": "^12.23.12"
}
```

### 项目结构变化

```
src/components/
├── ui/                    # 删除了大部分 shadcn 组件
│   └── morphing-text.tsx  # 保留自定义动画组件
├── magicui/               # 已迁移到 Radix UI + Framer Motion
│   ├── AnimatedButton.tsx
│   ├── TextRevealDemo.tsx
│   └── MagicShowcase.tsx
└── features/              # 已更新为使用 Radix UI
    ├── HelloDemo.tsx
    └── OpenAIChatDemo.tsx
```

---

**更新日期**: 2025-01-18
**Radix UI Themes 版本**: 3.2.1
**维护者**: Fast MVP Team
