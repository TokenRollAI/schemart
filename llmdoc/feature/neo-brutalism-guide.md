# Neo-Brutalism 设计系统使用指南

本文档详细说明了 Fast MVP 项目中 Neo-Brutalism（新粗野主义）设计系统的使用方法、组件引入规范和最佳实践。

## 目录

- [设计理念](#设计理念)
- [核心特征](#核心特征)
- [颜色系统](#颜色系统)
- [组件使用](#组件使用)
- [布局系统](#布局系统)
- [最佳实践](#最佳实践)

---

## 设计理念

Neo-Brutalism（新粗野主义）是一种强调功能性、高对比度和视觉冲击力的设计风格。其核心理念包括：

- **功能优先** - 清晰的层级结构，易于理解和使用
- **视觉诚实** - 不隐藏元素的本质，直接展示结构
- **触感体验** - 通过粗边框和硬阴影营造物理感
- **高对比度** - 黑白分明，确保可读性和可访问性
- **无装饰** - 去除不必要的视觉元素，专注内容

---

## 核心特征

### 1. 粗黑边框系统

所有组件都使用实心黑色边框，厚度根据组件类型区分：

```css
--border-thick: 3px    /* 大型卡片、面板 */
--border-medium: 2px   /* 中型组件、输入框 */
--border-thin: 1px     /* 表格行分隔线 */
```

### 2. 硬阴影系统

使用无模糊的偏移阴影，创造"浮起"的视觉效果：

```css
--shadow-lg: 6px 6px 0 rgba(0, 0, 0, 0.15)   /* 大型面板 */
--shadow-md: 4px 4px 0 rgba(0, 0, 0, 0.15)   /* 中型卡片 */
--shadow-sm: 2px 2px 0 rgba(0, 0, 0, 0.15)   /* 小型元素 */
```

### 3. 圆角系统

大圆角营造现代感和友好性：

```css
--radius-xl: 20px   /* 大型卡片 */
--radius-lg: 16px   /* 中型卡片 */
--radius-md: 12px   /* 按钮 */
--radius-sm: 10px   /* 输入框 */
--radius-xs: 8px    /* 徽章 */
```

### 4. 交互反馈

按钮按压效果（悬停时）：

```css
/* 默认状态 */
box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.15);

/* 悬停状态 */
transform: translate(2px, 2px);
box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.15);

/* 激活状态 */
transform: translate(4px, 4px);
box-shadow: none;
```

---

## 颜色系统

### 背景颜色

```css
--bg-base: #f5f5f3         /* 页面背景 - 浅米色 */
--bg-panel: #fafaf8        /* 面板背景 - 奶油白 */
--bg-white: #ffffff        /* 纯白 - 用于输入框和表格 */
--bg-secondary: #f0f0ee    /* 次要背景 - 浅灰 */
```

### 文本颜色

```css
--text-primary: #000000    /* 主要文字 - 纯黑 */
--text-secondary: #666666  /* 次要文字 - 深灰 */
```

### 强调色

```css
--color-yellow: #ffd966    /* 主要操作、警告 */
--color-pink: #ff7aa3      /* 危险操作、删除 */
--color-blue: #6ba4ff      /* 信息、进行中 */
--color-green: #5fe0a8     /* 成功、完成 */
```

### 边框颜色

```css
--border-primary: #000000  /* 主要边框 - 纯黑 */
--border-light: #e0e0e0    /* 轻量分隔线 - 浅灰 */
```

---

## 组件使用

### 卡片组件

#### 大型卡片 (`.brutalist-card`)

用于主要内容区域、表格容器等。

```html
<div class="brutalist-card p-8">
  <h2 class="brutalist-heading">Card Title</h2>
  <p class="brutalist-text brutalist-text-secondary">Card content...</p>
</div>
```

**特点：**
- 3px 黑色边框
- 20px 大圆角
- 6px 硬阴影
- 奶油白背景 (`#fafaf8`)

#### 小型卡片 (`.brutalist-card-sm`)

用于统计卡片、次要内容区域。

```html
<div class="brutalist-card-sm p-6">
  <h3 class="brutalist-heading text-lg">Small Card</h3>
  <p class="brutalist-text">Content here...</p>
</div>
```

**特点：**
- 3px 黑色边框
- 16px 圆角
- 4px 硬阴影

#### 统计卡片 (`.brutalist-stat-card`)

用于展示数据统计。

```html
<div class="brutalist-stat-card">
  <div class="brutalist-stat-value">42</div>
  <div class="brutalist-stat-label">Total Users</div>
</div>
```

**结构：**
- 数值：28px 粗体黑色
- 标签：14px 灰色

---

### 按钮组件

#### 基础按钮 (`.brutalist-button`)

```html
<button class="brutalist-button">
  Click Me
</button>
```

**默认颜色：** 黄色 (`#ffd966`)

#### 颜色变体

```html
<!-- 粉色 - 危险操作 -->
<button class="brutalist-button brutalist-button-pink">
  Delete
</button>

<!-- 蓝色 - 信息操作 -->
<button class="brutalist-button brutalist-button-blue">
  View Info
</button>

<!-- 绿色 - 成功操作 -->
<button class="brutalist-button brutalist-button-green">
  Confirm
</button>
```

**按钮规范：**
- Padding: `12px 28px`
- 边框: 3px 黑色
- 圆角: 12px
- 阴影: 4px 偏移
- 字重: 600 (Semibold)
- 颜色: 黑色文字

**按压效果：**
```css
/* Hover */
transform: translate(2px, 2px);
box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.15);

/* Active */
transform: translate(4px, 4px);
box-shadow: none;
```

---

### 输入框组件

#### 文本输入框 (`.brutalist-input`)

```html
<div>
  <label class="brutalist-text block mb-2 font-semibold">
    Username
  </label>
  <input
    type="text"
    class="brutalist-input"
    placeholder="Enter your name"
  />
</div>
```

**特点：**
- 纯白背景 (`#ffffff`)
- 2px 黑色边框
- 10px 圆角
- Padding: `12px 16px`
- 无阴影
- 全宽 (`width: 100%`)

---

### 徽章组件

#### 基础徽章 (`.brutalist-badge`)

```html
<span class="brutalist-badge brutalist-badge-blue">
  In Progress
</span>
```

**颜色变体：**

```html
<!-- 蓝色 -->
<span class="brutalist-badge brutalist-badge-blue">Info</span>

<!-- 绿色 -->
<span class="brutalist-badge brutalist-badge-green">Success</span>

<!-- 黄色 -->
<span class="brutalist-badge brutalist-badge-yellow">Warning</span>

<!-- 排队状态（白色 + 黑边） -->
<span class="brutalist-badge brutalist-badge-queued">Queued</span>
```

**规范：**
- Padding: `6px 12px`
- 圆角: 8px
- 字重: 600
- 字号: 12px
- 黑色文字

---

### 表格组件

#### 完整表格示例

```html
<div class="brutalist-card p-8">
  <table class="brutalist-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-semibold">#1</td>
        <td>John Doe</td>
        <td>
          <span class="brutalist-badge brutalist-badge-green">
            Active
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**表格规范：**
- 表头背景: 浅灰 (`#f0f0ee`)
- 表头边框: 2px 黑色底部分隔
- 单元格 Padding: `16px`
- 行分隔线: 1px 浅灰 (`#e0e0e0`)
- 最后一行无底部边框

---

### 开关组件

#### Toggle 开关 (`.brutalist-toggle`)

```html
<div
  class="brutalist-toggle active"
  onclick="this.classList.toggle('active')"
>
  <div class="brutalist-toggle-knob"></div>
</div>
```

**React 示例：**

```tsx
const [enabled, setEnabled] = useState(false)

<div
  className={`brutalist-toggle ${enabled ? 'active' : ''}`}
  onClick={() => setEnabled(!enabled)}
>
  <div className="brutalist-toggle-knob"></div>
</div>
```

**规范：**
- 尺寸: 60px × 32px
- 边框: 3px 黑色
- 圆角: 16px (pill shape)
- 未激活: 灰色背景 (`#999999`)
- 激活: 绿色背景 (`#5fe0a8`)
- 按钮: **黑色圆形** (20px × 20px)
- 按钮位置: 未激活左侧，激活右侧

---

### 文字组件

#### 标题系统

```html
<!-- 页面主标题 -->
<h1 class="brutalist-title">Page Title</h1>

<!-- 区块标题 -->
<h2 class="brutalist-heading">Section Heading</h2>

<!-- 普通文字 -->
<p class="brutalist-text">Normal text content.</p>

<!-- 次要文字 -->
<p class="brutalist-text brutalist-text-secondary">
  Secondary text content.
</p>
```

**字号规范：**
- `.brutalist-title`: 32px, 粗体 (700)
- `.brutalist-heading`: 20px, Semibold (600)
- `.brutalist-text`: 14px, 正常 (400)
- `.brutalist-stat-value`: 28px, 粗体 (700)

---

## 布局系统

### 容器 (`.brutalist-container`)

```html
<div class="brutalist-container">
  <!-- 页面内容 -->
</div>
```

**规范：**
- 最大宽度: 1400px
- 居中对齐
- Padding: `40px 20px`

### 响应式网格

使用 Tailwind CSS 的 Grid 系统：

```html
<!-- 统计卡片网格 -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="brutalist-stat-card">...</div>
  <div class="brutalist-stat-card">...</div>
  <div class="brutalist-stat-card">...</div>
</div>

<!-- 两列布局 -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div class="lg:col-span-2 brutalist-card">...</div>
  <div class="brutalist-card">...</div>
</div>
```

---

## 最佳实践

### 1. 组件组合

**✅ 推荐：** 使用预定义的 Brutalist 类

```html
<div class="brutalist-card p-8">
  <h2 class="brutalist-heading">Title</h2>
  <p class="brutalist-text brutalist-text-secondary">Description</p>
  <button class="brutalist-button">Action</button>
</div>
```

**❌ 避免：** 自定义样式覆盖

```html
<!-- 不要这样做 -->
<div class="brutalist-card" style="border: 1px solid blue;">
  ...
</div>
```

### 2. 颜色使用

**✅ 推荐：** 使用语义化颜色变体

```html
<button class="brutalist-button brutalist-button-pink">Delete</button>
<span class="brutalist-badge brutalist-badge-green">Success</span>
```

**❌ 避免：** 硬编码颜色

```html
<!-- 不要这样做 -->
<button class="brutalist-button bg-red-500">Delete</button>
```

### 3. 间距规范

使用 Tailwind 的间距类，保持一致性：

```html
<!-- 卡片间距 -->
<div class="space-y-6">  <!-- 6 × 0.25rem = 1.5rem -->
  <div class="brutalist-card p-8">...</div>
  <div class="brutalist-card p-8">...</div>
</div>

<!-- 表单间距 -->
<div class="space-y-4">  <!-- 4 × 0.25rem = 1rem -->
  <div>...</div>
  <div>...</div>
</div>
```

### 4. 响应式设计

优先使用 Tailwind 的响应式前缀：

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- 移动端: 1列, 平板: 2列, 桌面: 3列 -->
</div>

<div class="p-4 md:p-6 lg:p-8">
  <!-- 响应式 padding -->
</div>
```

### 5. 可访问性

确保所有交互元素可访问：

```html
<!-- 正确的标签关联 -->
<label for="username" class="brutalist-text block mb-2 font-semibold">
  Username
</label>
<input
  id="username"
  type="text"
  class="brutalist-input"
  aria-label="Username input"
/>

<!-- 按钮禁用状态 -->
<button
  class="brutalist-button"
  disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### 6. 状态反馈

提供清晰的视觉反馈：

```html
<!-- 成功状态 -->
<div class="brutalist-card-sm p-4 bg-green-50">
  <div class="flex items-center gap-2">
    <span class="brutalist-badge brutalist-badge-green">Success</span>
    <span class="brutalist-text font-semibold">Operation completed</span>
  </div>
</div>

<!-- 错误状态 -->
<div class="brutalist-card-sm p-4 bg-red-50">
  <div class="flex items-center gap-2">
    <span class="brutalist-badge brutalist-badge-pink">Error</span>
    <span class="brutalist-text font-semibold">Something went wrong</span>
  </div>
</div>
```

---

## 常见模式

### 页面标题区域

```html
<div class="mb-8">
  <h1 class="brutalist-title">Page Title</h1>
  <p class="brutalist-text brutalist-text-secondary max-w-3xl">
    Page description and context...
  </p>
</div>
```

### 统计仪表板

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div class="brutalist-stat-card">
    <div class="brutalist-stat-value">42</div>
    <div class="brutalist-stat-label">Total Items</div>
  </div>
  <!-- 更多统计卡片... -->
</div>
```

### 表单布局

```html
<div class="brutalist-card p-8">
  <h2 class="brutalist-heading mb-6">Form Title</h2>

  <form class="space-y-4">
    <div>
      <label class="brutalist-text block mb-2 font-semibold">
        Field Label
      </label>
      <input type="text" class="brutalist-input" />
    </div>

    <div class="flex gap-3">
      <button type="submit" class="brutalist-button flex-1">
        Submit
      </button>
      <button type="button" class="brutalist-button brutalist-button-pink">
        Cancel
      </button>
    </div>
  </form>
</div>
```

### 数据表格

```html
<div class="brutalist-card p-8">
  <div class="flex items-center justify-between mb-6">
    <h2 class="brutalist-heading">Data Table</h2>
    <button class="brutalist-button">Add New</button>
  </div>

  <table class="brutalist-table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>
          <button class="brutalist-button brutalist-button-blue text-sm py-2 px-4">
            View
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 与 React 集成

### 基础组件示例

```tsx
// Button Component
interface ButtonProps {
  variant?: 'default' | 'pink' | 'blue' | 'green'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export const BrutalistButton = ({
  variant = 'default',
  children,
  onClick,
  disabled
}: ButtonProps) => {
  const variantClass = {
    default: '',
    pink: 'brutalist-button-pink',
    blue: 'brutalist-button-blue',
    green: 'brutalist-button-green',
  }[variant]

  return (
    <button
      className={`brutalist-button ${variantClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

### 状态管理示例

```tsx
// Toggle Component
export const BrutalistToggle = ({
  enabled,
  onChange
}: {
  enabled: boolean
  onChange: (value: boolean) => void
}) => {
  return (
    <div
      className={`brutalist-toggle ${enabled ? 'active' : ''}`}
      onClick={() => onChange(!enabled)}
    >
      <div className="brutalist-toggle-knob"></div>
    </div>
  )
}
```

---

## 性能优化

### CSS 加载

所有 Brutalist 样式定义在 `src/app/(pages)/globals.css` 中，确保只加载一次：

```css
/* globals.css */
@import 'tailwindcss';

/* Neo-Brutalism Design System */
:root { ... }
.brutalist-card { ... }
/* ... */
```

### 避免内联样式

**✅ 推荐：**
```html
<div class="brutalist-card p-8">...</div>
```

**❌ 避免：**
```html
<div style="background: #fafaf8; border: 3px solid black; ...">...</div>
```

---

## 设计原则总结

1. **保持一致性** - 始终使用预定义的组件类
2. **功能优先** - 清晰的视觉层级
3. **高对比度** - 确保可读性
4. **触感反馈** - 按钮有物理按压感
5. **无装饰** - 专注内容，去除多余元素
6. **可访问性** - 所有交互元素可键盘访问
7. **响应式** - 适配所有屏幕尺寸

---

## 相关资源

- **全局样式**: `src/app/(pages)/globals.css`
- **示例页面**:
  - `/` - 主页
  - `/trpc` - tRPC Demo
  - `/openai` - AI Chat Demo
- **设计参考**: [Neo-Brutalism Web Design](https://hype4.academy/articles/design/brutalist-web-design)

---

**更新日期**: 2025-01-18
**版本**: 1.0.0
**维护者**: Fast MVP Team
