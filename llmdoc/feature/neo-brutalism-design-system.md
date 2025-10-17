# Neo-Brutalism 设计系统

## 1. Purpose

描述项目采用的 Neo-Brutalism 设计系统架构、实现原理和使用规范，确保开发团队能够正确应用设计系统保持界面一致性。

## 2. How it Works / Step-by-Step Guide

### 设计理念

Neo-Brutalism 是一种强调功能性、粗犷边框和硬阴影的设计风格，具有以下特征：
- **粗边框**：使用 2-3px 的黑色边框
- **硬阴影**：无模糊的偏移阴影效果
- **大胆配色**：使用鲜艳的对比色
- **几何形状**：圆角矩形和清晰的几何线条
- **功能性优先**：去除不必要的装饰元素

### 技术架构

**基础技术栈：**
- **Tailwind CSS 4**：提供基础样式系统
- **Radix UI Themes 3.2.1**：提供组件系统和主题变量
- **自定义 CSS 变量**：定义设计令牌
- **IBM Plex Sans**：主字体

**样式层级：**
1. **CSS 变量层**：定义设计令牌（颜色、边框、阴影等）
2. **Tailwind 基础层**：提供工具类
3. **Radix UI 覆盖层**：定制 Radix 组件样式
4. **Brutalist 类层**：自定义组件样式类

### 使用指南

**1. 布局容器**
```jsx
<div className='brutalist-container'>
  {/* 页面内容 */}
</div>
```

**2. 卡片组件**
```jsx
// 大卡片
<div className='brutalist-card p-8'>
  {/* 内容 */}
</div>

// 小卡片
<div className='brutalist-card-sm p-6'>
  {/* 内容 */}
</div>
```

**3. 按钮组件**
```jsx
// 默认按钮
<button className='brutalist-button'>按钮</button>

// 彩色按钮
<button className='brutalist-button brutalist-button-pink'>粉色按钮</button>
<button className='brutalist-button brutalist-button-blue'>蓝色按钮</button>
<button className='brutalist-button brutalist-button-green'>绿色按钮</button>
```

**4. 输入组件**
```jsx
<input
  type='text'
  className='brutalist-input'
  placeholder='输入内容'
/>
```

**5. 徽章组件**
```jsx
<span className='brutalist-badge brutalist-badge-blue'>状态</span>
<span className='brutalist-badge brutalist-badge-green'>成功</span>
<span className='brutalist-badge brutalist-badge-yellow'>警告</span>
<span className='brutalist-badge brutalist-badge-queued'>排队</span>
```

**6. 表格组件**
```jsx
<table className='brutalist-table'>
  <thead>
    <tr>
      <th>列名</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>数据</td>
    </tr>
  </tbody>
</table>
```

**7. 统计卡片**
```jsx
<div className='brutalist-stat-card'>
  <div className='brutalist-stat-value'>数值</div>
  <div className='brutalist-stat-label'>标签</div>
</div>
```

**8. 开关组件**
```jsx
<div className={`brutalist-toggle ${isActive ? 'active' : ''}`}>
  <div className='brutalist-toggle-knob'></div>
</div>
```

### Radix UI 集成

项目使用 Radix UI Themes 作为组件基础，通过 CSS 覆盖实现 Brutalist 风格：

**主题配置（layout.tsx）：**
```jsx
<Theme
  accentColor='orange'
  grayColor='sand'
  radius='large'
  appearance='light'
>
  {children}
</Theme>
```

**样式覆盖（globals.css）：**
```css
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

## 3. Relevant Code Modules

### 3.1 样式系统文件

- `src/app/(pages)/globals.css` - 核心样式定义，包含 CSS 变量、Brutalist 类和 Radix UI 覆盖
- `tailwind.config.ts` - Tailwind CSS 配置，定义主题扩展
- `src/app/(pages)/layout.tsx` - 根布局，配置 Radix UI Theme

### 3.2 设计令牌定义

**颜色系统：**
- `--bg-base`: #f5f5f3 - 页面背景色
- `--bg-panel`: #fafaf8 - 面板背景色
- `--bg-white`: #ffffff - 纯白色
- `--color-pink`: #ff7aa3 - 粉色
- `--color-yellow`: #ffd966 - 黄色
- `--color-blue`: #6ba4ff - 蓝色
- `--color-green`: #5fe0a8 - 绿色
- `--border-primary`: #000000 - 主边框色

**边框和阴影：**
- `--border-thick`: 3px - 粗边框
- `--border-medium`: 2px - 中等边框
- `--border-thin`: 1px - 细边框
- `--shadow-lg`: 6px 6px 0 rgba(0, 0, 0, 0.15) - 大阴影
- `--shadow-md`: 4px 4px 0 rgba(0, 0, 0, 0.15) - 中阴影
- `--shadow-sm`: 2px 2px 0 rgba(0, 0, 0, 0.15) - 小阴影

**圆角：**
- `--radius-xl`: 20px - 超大圆角
- `--radius-lg`: 16px - 大圆角
- `--radius-md`: 12px - 中等圆角
- `--radius-sm`: 10px - 小圆角
- `--radius-xs`: 8px - 超小圆角

### 3.3 组件实现示例

- `src/app/(pages)/page.tsx` - 首页，展示完整的设计系统应用
- `src/components/chat/OpenAIChatDemo.tsx` - AI 聊天组件，实际应用示例
- `src/components/ui/morphing-text.tsx` - 动态文字效果组件

### 3.4 字体系统

- **主字体**：IBM Plex Sans（400, 500, 600, 700 权重）
- **字体变量**：`--font-ibm-plex`
- **备选字体**：Inter, Segoe UI, Helvetica, sans-serif

## 4. Attention

- **样式一致性**：始终使用预定义的 Brutalist 类，避免硬编码样式值
- **响应式设计**：结合 Tailwind 的响应式类使用 Brutalist 组件
- **交互效果**：按钮和交互元素已内置 hover 和 active 状态效果
- **主题集成**：新组件需要考虑与 Radix UI Themes 的集成
- **颜色使用**：使用语义化的颜色类名，而非直接的颜色值
- **字体配置**：确保使用 IBM Plex Sans 字体保持视觉一致性
- **CSS 变量优先**：新样式应优先使用 CSS 变量而非硬编码值
- **测试兼容性**：确保新组件在不同浏览器和设备上表现一致