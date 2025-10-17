# 最近架构变更记录

## 1. Purpose

记录 Fast MVP 项目最近的架构变更，包括组件库迁移、设计系统演进、依赖升级和重要的技术改进，确保团队成员了解项目演进历史。

## 2. How it Works / Step-by-Step Guide

### 2025年1月重要变更

#### 2.1 环境变量验证系统修复

**变更时间**: 2025-01-18

**问题描述**:
- Zod 4.x 的 `.url()` 验证器不再接受空字符串
- 用户在不使用某些 AI 提供商时，留空的 `*_BASE_URL` 环境变量导致应用启动失败

**解决方案**:
```typescript
// 修复前
OPENAI_BASE_URL: z.string().url().optional()

// 修复后
OPENAI_BASE_URL: z
  .string()
  .url()
  .default('https://api.openai.com/v1')
  .optional()
  .or(z.literal(''))
  .transform((val) => (val === '' ? undefined : val))
```

**影响范围**:
- `src/lib/env.ts` - 核心验证逻辑
- 所有 AI 提供商的 BASE_URL 环境变量
- `.env.example` 配置模板

**向后兼容性**: 完全兼容，用户现有配置无需修改

#### 2.2 组件库架构重大变更

**变更时间**: 2025-01-18

**迁移内容**:

**移除的组件库**:
- `shadcn/ui` 组件系统
- `MagicUI` 动画组件库
- `lucide-react` 图标库
- `class-variance-authority` 样式变体库
- `tailwindcss-animate` 动画工具

**新增的组件库**:
- `@radix-ui/themes` v3.2.1 - 完整的 UI 组件系统
- `@radix-ui/react-icons` v1.3.2 - 官方图标库
- Neo-Brutalism 设计系统 (自定义 CSS)

**设计系统迁移**:
```diff
- 语义化主题类 (bg-primary, text-secondary-foreground)
- 渐变效果 (bg-gradient-primary, text-gradient-warm)
- 阴影效果 (shadow-warm, glow-primary)
+ Brutalist CSS 类 (brutalist-container, brutalist-card)
+ 硬边框设计 (border-thick, border-medium)
+ 大胆阴影 (shadow-lg, shadow-md)
+ 鲜明色彩 (var(--color-pink), var(--color-blue))
```

**文件变更**:
- 删除: `src/components/ui/` (所有 shadcn/ui 组件)
- 删除: `src/components/magicui/` (所有 MagicUI 组件)
- 删除: `src/app/(pages)/magic/page.tsx` (动画演示页面)
- 更新: `src/app/(pages)/globals.css` (全新 Neo-Brutalism 设计系统)
- 更新: `tailwind.config.ts` (移除动画插件)

#### 2.3 依赖版本升级

**主要依赖升级**:
```json
{
  "next": "15.5.2 → 15.5.6",
  "react": "19.1.0 → 19.2.0",
  "react-dom": "19.1.0 → 19.2.0",
  "zod": "3.25.76 → 4.1.12",
  "@ai-sdk/*": "2.0.11 → 2.0.33+",
  "ai": "5.0.28 → 5.0.76",
  "drizzle-orm": "0.44.5 → 0.44.6",
  "@libsql/client": "0.15.14 → 0.15.15"
}
```

**开发工具升级**:
```json
{
  "@biomejs/biome": "2.2.4 → 2.2.6",
  "@types/node": "20 → 24.8.1",
  "@types/react": "19 → 19.2.2",
  "tailwindcss": "4 → 4.1.14"
}
```

#### 2.4 数据库初始化完成

**操作时间**: 2025-01-18

**完成的工作**:
- 复制 `.env.example` 到 `.env.local`
- 运行 `pnpm db:push` 初始化数据库结构
- 创建 `local.db` SQLite 数据库文件 (16KB)
- 验证 `hello` 表结构创建成功

**数据库配置**:
```typescript
// 当前配置
DB_FILE_NAME=file:local.db

// 表结构
CREATE TABLE hello (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0
);
```

#### 2.5 CLAUDE.md 指南更新

**更新内容**:
- 移除 MagicUI 组件引用
- 更新为 Neo-Brutalism 设计系统指南
- 添加环境变量配置说明
- 更新组件使用优先级
- 添加新设计令牌文档引用

**设计指南变更**:
```diff
- 使用 shadcn/ui 或 MagicUI 组件
- 语义化颜色系统 (bg-primary, text-secondary)
- 渐变和发光效果
+ 使用 Brutalist CSS 类
+ 硬边框设计 (border-thick)
+ 鲜明的扁平色彩
+ 大胆的几何阴影
```

### 技术影响分析

#### 2.6 性能影响

**积极影响**:
- 减少了 54 个依赖包的体积
- 移除了复杂的动画系统，提升加载速度
- Zod 4.x 性能优化，验证速度提升

**潜在影响**:
- 失去了 MagicUI 的复杂动画效果
- 需要适应新的设计系统开发模式

#### 2.7 开发体验变化

**改进**:
- 环境变量配置更灵活，支持空字符串
- 组件系统更统一，基于 Radix UI Themes
- 设计系统更简洁，减少 CSS 复杂度

**学习成本**:
- 团队需要熟悉 Neo-Brutalism 设计原则
- 新的组件使用模式和命名约定
- Brutalist CSS 类的使用方法

## 3. Relevant Code Modules

### 3.1 核心变更文件

- `src/lib/env.ts` - 环境变量验证修复
- `src/app/(pages)/globals.css` - Neo-Brutalism 设计系统
- `package.json` - 依赖版本和组件库变更
- `tailwind.config.ts` - 配置简化
- `CLAUDE.md` - 开发指南更新

### 3.2 移除的模块

- `src/components/ui/` - shadcn/ui 组件库
- `src/components/magicui/` - MagicUI 动画组件
- `src/app/(pages)/magic/` - 动画演示页面

### 3.3 新增模块

- Neo-Brutalism CSS 设计系统
- 环境变量验证文档 (`llmdoc/feature/environment-variables-validation.md`)

## 4. Attention

- **设计系统迁移**: 所有新组件必须使用 Neo-Brutalism 设计系统
- **向后兼容**: 环境变量修复完全向后兼容
- **依赖清理**: 移除了大量未使用的依赖，项目更轻量
- **文档同步**: 相关文档已同步更新，反映当前架构状态
- **测试验证**: 数据库初始化和开发服务器启动均已验证成功
- **设计一致性**: 确保所有新页面遵循 Brutalist 设计原则