# 架构变更记录

## 1. Purpose

记录 Fast MVP 项目的重要架构变更、组件库迁移和设计系统演进，帮助开发团队了解项目演进历史和变更原因。

## 2. How it Works / Step-by-Step Guide

### 变更时间线

#### 2024年10月 - 组件库简化重构

**变更背景：**
- 简化项目架构，减少维护复杂度
- 统一设计语言，提高开发效率
- 减少包体积和依赖复杂度

**主要变更：**

**1. 移除 shadcn/ui 组件库**
```json
// 删除的依赖包
{
  "class-variance-authority": "^0.7.1",      // CVA 变体系统
  "@radix-ui/react-label": "^2.1.7",          // Radix Label 组件
  "@radix-ui/react-slot": "^1.2.3",           // Radix Slot 组件
  "lucide-react": "^0.542.0",                  // 图标库
  "tailwindcss-animate": "^1.0.7",            // 动画工具
  "shadcn": "^3.0.0"                          // shadcn CLI
}
```

**删除的组件文件：**
- `src/components/ui/button.tsx` - 按钮组件（6种变体）
- `src/components/ui/card.tsx` - 卡片组件系列
- `src/components/ui/input.tsx` - 输入框组件
- `src/components/ui/badge.tsx` - 徽章组件
- `src/components/ui/label.tsx` - 标签组件
- `src/components/ui/table.tsx` - 表格组件集

**2. 移除 MagicUI 动画库**
```json
// 删除的动画组件
src/components/magicui/
├── AnimatedButton.tsx     // 扫描效果动画按钮
├── ParticleDemo.tsx       // Canvas 粒子系统
├── TextRevealDemo.tsx     // 文字揭示效果
└── MagicShowcase.tsx      // 集成展示组件
```

**删除的页面：**
- `src/app/(pages)/magic/page.tsx` - MagicUI 演示页面

**3. 引入 Radix UI Themes**
```json
// 新增的依赖包
{
  "@radix-ui/themes": "^3.2.1",           // 核心 UI 组件库
  "@radix-ui/react-icons": "^1.3.2"       // 图标库
}
```

**4. 实现 Neo-Brutalism 设计系统**

**样式系统重构：**
- 新增完整的 CSS 变量系统
- 实现 Brutalist CSS 类库
- 覆盖 Radix UI 默认样式
- 统一设计令牌（颜色、边框、阴影、圆角）

**设计特点：**
- 粗犷边框（2-3px 黑色边框）
- 硬阴影（无模糊偏移阴影）
- 大胆配色（粉、黄、蓝、绿对比色）
- 几何形状（清晰线条和大圆角）

**5. 页面样式统一**

**更新的页面：**
- `src/app/(pages)/page.tsx` - 采用 Brutalist 样式的首页
- `src/app/(pages)/openai/page.tsx` - AI 聊天页面样式更新
- `src/app/(pages)/trpc/page.tsx` - tRPC 演示页面样式更新

**布局更新：**
- `src/app/(pages)/layout.tsx` - 集成 Radix UI Theme
- `src/app/(pages)/globals.css` - 重构全局样式系统

### 技术影响分析

**包体积优化：**
- 删除约 15 个依赖包
- 减少约 200KB+ 的 node_modules 大小
- 简化依赖树，减少潜在冲突

**开发体验提升：**
- 统一的 CSS 类系统，减少样式编写时间
- 设计令牌化，确保视觉一致性
- 简化的组件结构，降低学习成本

**维护成本降低：**
- 减少自定义组件维护工作
- 统一的设计系统，减少样式不一致问题
- 更少的依赖包，降低安全风险

**性能优化：**
- 减少 CSS 体积和复杂度
- 移除复杂的动画组件（粒子系统等）
- 更快的样式解析和渲染

### 迁移指南

**从 shadcn/ui 迁移到 Radix UI Themes：**

**1. Button 组件迁移**
```tsx
// 旧方式 (shadcn/ui)
import { Button } from '@/components/ui/button'
<Button variant="default" size="lg">按钮</Button>

// 新方式 (Radix UI Themes + Brutalist)
<button className='brutalist-button brutalist-button-blue'>按钮</button>
```

**2. Card 组件迁移**
```tsx
// 旧方式 (shadcn/ui)
import { Card, CardContent, CardHeader } from '@/components/ui/card'
<Card>
  <CardHeader>标题</CardHeader>
  <CardContent>内容</CardContent>
</Card>

// 新方式 (Brutalist)
<div className='brutalist-card p-8'>
  <h2 className='brutalist-heading'>标题</h2>
  <p className='brutalist-text'>内容</p>
</div>
```

**3. Input 组件迁移**
```tsx
// 旧方式 (shadcn/ui)
import { Input } from '@/components/ui/input'
<Input placeholder="输入内容" />

// 新方式 (Brutalist)
<input className='brutalist-input' placeholder="输入内容" />
```

**样式系统迁移：**
```css
/* 旧方式：使用 Tailwind 类 */
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">

/* 新方式：使用 Brutalist 类 */
<button className="brutalist-button brutalist-button-blue">
```

## 3. Relevant Code Modules

### 3.1 核心样式文件

- `src/app/(pages)/globals.css` - 完整的 Neo-Brutalism 样式系统定义
- `tailwind.config.ts` - Tailwind 配置，支持新的设计令牌
- `src/app/(pages)/layout.tsx` - Radix UI Theme 配置和字体设置

### 3.2 页面实现示例

- `src/app/(pages)/page.tsx` - 首页，展示完整的 Brutalist 设计系统
- `src/app/(pages)/openai/page.tsx` - AI 聊天页面，Brutalist 样式应用
- `src/components/chat/OpenAIChatDemo.tsx` - 聊天组件，使用新样式系统

### 3.3 保留的组件

- `src/components/ui/morphing-text.tsx` - 文字动画组件（唯一保留的复杂动画）
- `src/components/providers/TrpcProvider.tsx` - tRPC 提供者（无变更）

### 3.4 配置变更

- `package.json` - 依赖包的添加和删除
- `pnpm-lock.yaml` - 锁定新版本的依赖包
- `.env.example` - 环境变量模板（无变更）

## 4. Attention

- **向后兼容**: 本次重构为破坏性变更，现有代码需要适配新的样式系统
- **学习成本**: 开发团队需要熟悉 Radix UI Themes 和 Brutalist 设计系统
- **设计一致性**: 所有新组件必须遵循 Neo-Brutalism 设计规范
- **性能监控**: 虽然移除了复杂动画，但仍需监控页面性能表现
- **渐进迁移**: 可以逐步迁移现有页面，不必一次性全部重构
- **文档更新**: 相关技术文档需要同步更新以反映新的架构
- **测试覆盖**: 确保重构后的组件功能完整性和样式一致性