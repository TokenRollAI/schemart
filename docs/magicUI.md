# 在本项目中使用 shadcn/ui 的团队指南

本文档旨在帮助团队成员快速、高效、统一地在当前项目中使用 `shadcn/ui` 组件库。

## 1. 核心理念：它不是一个组件“库”

与 Ant Design 或 Element Plus 不同，`shadcn/ui` **不是一个发布在 npm 上的传统组件库**。你不能通过 `npm install` 来安装它的组件。

相反，`shadcn/ui` 是一系列你可以直接复制粘贴到项目中的、可重用的组件代码。我们通过其官方 CLI 工具来完成这个“复制粘贴”的过程。

这种模式的**核心优势**：

- **完全所有权**：组件代码直接存在于你的项目中，你可以像修改自己写的代码一样，自由地修改组件的任何部分（样式、逻辑、结构），而无需担心库版本升级带来的 breaking changes。
- **高度可定制**：不受库的限制，可以轻松地将组件调整为完全符合我们项目的设计规范。
- **无额外打包体积**：你只添加你需要的组件，最终打包产物中不会包含任何未使用的代码。

## 2. 项目配置概览

项目的 `shadcn/ui` 配置存储在根目录的 `components.json` 文件中。关键配置如下：

- **Style**: `default` (默认风格)
- **Base Color**: `slate` (基础色系)
- **CSS Variables**: `true` (使用 CSS 变量进行主题化)
- **Components Alias**: `@/components` (组件的存放路径，例如 `button` 会被安装到 `src/components/ui/button.tsx`)
- **Utils Alias**: `@/lib/utils` (工具函数，如 `cn` 的存放路径 `src/lib/utils/utils.ts`)

`cn` 函数是我们项目中处理 CSS 类名的标准方式，它结合了 `clsx` 和 `tailwind-merge`，可以智能地处理条件类名和合并 Tailwind CSS 类，避免样式冲突。

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 3. 如何添加新组件？ (核心流程)

当需要使用一个新的 `shadcn/ui` 组件时，**请严格遵循以下步骤**：

1.  **确认组件名称**：访问官方文档 [ui.shadcn.com](https://ui.shadcn.com/docs/components/button) 查找你需要的组件，并获取其准确的**小写英文名称**（例如 `button`, `dialog`, `alert-dialog`）。

2.  **打开终端**：在项目根目录下打开终端。

3.  **运行 CLI 命令**：使用以下命令来添加组件。请注意，我们项目使用 `pnpm`。

    ```bash
    pnpm dlx shadcn-ui@latest add [component-name]
    ```

    **示例：**

    ```bash
    # 添加一个按钮
    pnpm dlx shadcn-ui@latest add button

    # 添加一个对话框 (它可能会自动安装依赖的子组件，如 dialog-header 等)
    pnpm dlx shadcn-ui@latest add dialog
    ```

4.  **检查变更**：命令执行后，CLI 会自动将组件代码（如 `button.tsx`）创建在 `src/components/ui/` 目录下。请检查 Git 的变更，确保文件已正确添加。

**请不要**从其他项目或网络上随意复制代码，始终使用 CLI 来确保版本和依赖的正确性。

## 4. 如何使用和定制组件？

### 使用组件

添加后，你可以像使用项目中的任何其他本地组件一样导入和使用它。

```tsx
// 位于: src/app/(pages)/page.tsx 或其他组件中

import { Button } from '@/components/ui/button'

export default function MyPage() {
  return (
    <div>
      <Button variant='outline' size='lg'>
        Click Me
      </Button>
    </div>
  )
}
```

### 定制组件

这是 `shadcn/ui` 最强大的地方。如果你觉得某个组件的样式或行为不满足需求：

1.  **直接找到文件**：直接在 `src/components/ui/` 目录下找到该组件的源文件（例如 `button.tsx`）。
2.  **直接修改代码**：像修改你自己的组件一样，直接修改它的 TSX 结构、Tailwind 类名、甚至是内部逻辑。

**示例**：假设我们希望所有 `default` 变体的按钮都有一个更深的 hover 背景色。

- 打开 `src/components/ui/button.tsx`。
- 找到 `buttonVariants` 中的 `default` 样式定义。
- 修改 `hover:bg-primary/90` 为 `hover:bg-primary/80`。
- 保存文件，项目中所有使用 `default` 变体的按钮都会立即更新，无需任何其他操作。

## 5. 注意事项

- **始终使用 CLI 添加组件**：这是确保一致性和正确性的关键。
- **定制前先思考**：在修改组件之前，请确认这种定制是项目范围内的通用需求，还是仅针对单个页面的特殊样式。对于后者，优先考虑通过 props 或外层 CSS 来实现。
- **保持依赖更新**：虽然组件代码是本地的，但 `shadcn-ui` CLI 本身会更新。定期（例如每月）可以运行 `pnpm dlx shadcn-ui@latest add --help` 看看是否有新的 CLI 选项或变更。
- **阅读官方文档**：当遇到组件的使用问题时，官方文档是最好的参考资料。
