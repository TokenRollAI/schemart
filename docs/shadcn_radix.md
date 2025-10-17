# 在项目中使用 shadcn/ui 和 Radix UI

本文档旨在帮助团队成员快速理解如何在当前项目中高效地使用 `shadcn/ui` 组件库及其底层依赖 Radix UI。

## 1. 核心概念与官方文档

- **Radix UI**: 一个底层的、无样式的、专注于可访问性的 React UI 组件库。它为我们提供了构建设计系统的坚实基础，处理了所有复杂的交互逻辑。
  - [Radix UI 官方文档](https://www.radix-ui.com/primitives/docs/overview/introduction)

- **shadcn/ui**: 这**不是**一个传统的组件库。它是一系列可复用的、你可以直接复制粘贴到你的项目中的组件。这些组件基于 Radix UI 和 Tailwind CSS 构建。
  - **核心优势**: 我们可以完全控制组件的代码，自由定制样式和逻辑，而不必担心复杂的封装或外部依赖更新带来的破坏性变更。
  - [shadcn/ui 官方文档](https://ui.shadcn.com/docs)

## 2. 项目中的版本与依赖

为了确保一致性，所有组件都基于以下关键依赖构建：

- `@radix-ui/react-label`: `^2.1.7`
- `@radix-ui/react-slot`: `^1.2.3`
- `class-variance-authority`: `^0.7.1`
- `clsx`: `^2.1.1`
- `tailwind-merge`: `^3.3.1`

请在扩展或修改组件时，留意这些版本可能带来的 API 差异。

## 3. 已集成的工具与组件

### 辅助函数 `cn`

我们在项目中封装了一个非常实用的类名合并函数 `cn`。

- **位置**: `src/lib/utils/utils.ts`
- **功能**: 它结合了 `clsx`（用于条件性地组合类名）和 `tailwind-merge`（用于智能地合并 Tailwind CSS 类，解决样式冲突）。
- **用法**:

  ```tsx
  import { cn } from '@/lib/utils/utils'

  // <div class="p-4 bg-red-500 font-bold">
  ;<div
    className={cn('p-2 bg-blue-500', 'p-4 bg-red-500', { 'font-bold': true })}
  />
  ```

  在编写组件时，你应该**始终**使用 `cn` 函数来处理动态或复杂的类名。

### 已集成组件清单

以下是已经通过 `shadcn/ui` CLI 添加到项目中的组件，可以直接使用：

- **路径**: `src/components/ui/`

- `Badge` (`badge.tsx`)
- `Button` (`button.tsx`)
- `Card` (`card.tsx`)
- `Input` (`input.tsx`)
- `Label` (`label.tsx`)
- `Table` (`table.tsx`)

在需要新组件时，请先检查此列表，避免重复添加。

## 4. 如何在项目中使用

### 添加新组件

如果现有组件不满足需求，你可以使用 `shadcn-ui` CLI 快速添加新组件。

```bash
# 确保 pnpm 已全局安装
pnpm dlx shadcn-ui@latest add [component-name]
```

例如，添加 `Dialog` 组件：
`pnpm dlx shadcn-ui@latest add dialog`

组件代码将被直接添加到 `src/components/ui/` 目录下，你可以根据项目需求自由修改。

### 业务代码示例

`src/components/helloDemo/HelloDemo.tsx` 是一个很好的实践范例。它展示了如何组合使用我们已有的 `ui` 组件来构建一个功能完整的业务模块。

以下是该示例的简化版，展示了核心用法：

```tsx
// 引用路径使用了别名 '@'，指向 'src/'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function MyBusinessComponent() {
  return (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>创建一个账户</CardTitle>
        <CardDescription>立即开始，享受完整体验。</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className='grid w-full items-center gap-4'>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='name'>名称</Label>
              <Input id='name' placeholder='请输入你的项目名称' />
            </div>
            {/* 其他表单项... */}
          </div>
          <Button className='mt-4 w-full'>提交</Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

**关键点**:

1.  **导入**: 直接从 `@/components/ui` 目录导入你需要的组件。
2.  **组合**: 像常规 React 组件一样自由组合它们，例如将 `Input` 和 `Label` 放入 `Card` 中。
3.  **样式**: 使用 Tailwind CSS 类名通过 `className` 属性直接覆盖或扩展样式，`cn` 函数会在底层帮助我们处理合并。
