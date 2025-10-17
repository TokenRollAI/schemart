# 项目初始化流程

## 1. Purpose

标准化的 Fast MVP 项目环境搭建流程，确保开发者能够快速配置开发环境、安装依赖并启动项目，避免常见的配置错误和环境问题。

## 2. How it Works / Step-by-Step Guide

### 步骤 1: 环境准备 (2 分钟)

1. **检查 Node.js 版本**

   ```bash
   node --version  # 确保 >= 20.0.0
   pnpm --version  # 确保 >= 10.0.0
   ```

2. **克隆项目仓库**
   ```bash
   git clone <repository-url>
   cd fast-mvp
   ```

### 步骤 2: 依赖安装 (3 分钟)

1. **安装项目依赖**

   ```bash
   pnpm install
   ```

2. **验证安装结果**
   ```bash
   # 检查关键依赖
   pnpm list next @trpc/server drizzle-orm ai
   ```

### 步骤 3: 环境变量配置 (5 分钟)

1. **复制环境变量模板**

   ```bash
   cp .env.example .env.local
   ```

2. **配置 AI 提供商 (至少选择一个)**

   **OpenAI 配置:**

   ```bash
   # .env.local
   OPENAI_API_KEY="sk-your-openai-api-key"
   OPENAI_BASE_URL="https://api.openai.com/v1"  # 可选，默认为此值
   OPENAI_MODEL="gpt-4o-mini"
   ```

   **Claude 配置:**

   ```bash
   # .env.local
   ANTHROPIC_API_KEY="sk-ant-your-claude-api-key"
   ANTHROPIC_BASE_URL="https://api.anthropic.com"  # 可选，默认为此值
   ANTHROPIC_MODEL="claude-3-5-sonnet-latest"
   ```

   **Gemini 配置:**

   ```bash
   # .env.local
   GOOGLE_API_KEY="your-google-api-key"
   GOOGLE_API_BASE_URL=""  # 可留空，使用默认端点
   GOOGLE_MODEL="gemini-2.0-flash-001"
   ```

   **重要说明:**
   - URL 环境变量（如 `OPENAI_BASE_URL`）可以留空，系统会使用默认值
   - 如果不使用某个 AI 提供商，可以将其 API Key 和 BASE_URL 留空

3. **验证环境变量**
   ```bash
   pnpm dev  # 启动开发服务器检查配置
   ```

   **常见环境变量问题:**
   - 如果出现 Zod 验证错误，检查 URL 格式是否正确
   - 空字符串的 URL 环境变量是允许的，系统会使用默认值
   - 确保至少配置了一个 AI 提供商的 API Key

### 步骤 4: 数据库初始化 (2 分钟)

1. **推送数据库 schema**

   ```bash
   pnpm db:push
   ```

2. **验证数据库连接**
   ```bash
   # 检查 local.db 文件是否创建
   ls -la local.db

   # 验证数据库文件大小和权限
   stat local.db
   ```

### 步骤 5: 开发服务器启动 (1 分钟)

1. **启动开发服务器**

   ```bash
   pnpm dev
   ```

2. **验证项目运行**
   - 访问 `http://localhost:3000` 查看主页
   - 测试 AI 聊天功能 (`/openai`)
   - 测试 tRPC CRUD 功能 (`/trpc`)
   - 检查控制台是否有环境变量验证错误

### 步骤 6: 开发工具验证 (可选，2 分钟)

1. **代码格式化检查**

   ```bash
   pnpm format
   pnpm lint
   ```

2. **构建测试**
   ```bash
   pnpm build
   ```

## 3. Relevant Code Modules

### 3.1 环境配置文件

- `.env.example` - 环境变量配置模板
- `src/lib/env.ts` - 环境变量验证逻辑
- `package.json` - 项目依赖和脚本定义

### 3.2 数据库相关

- `src/db/db.ts` - 数据库连接管理和schema导出
- `src/db/schema/hello.ts` - 示例数据表定义
- `drizzle.config.ts` - Drizzle ORM 配置（schema指向./src/db/db.ts）

### 3.3 开发脚本

- `package.json` 中的 scripts 部分
- `pnpm dev` - 开发服务器启动（使用Turbopack）
- `pnpm db:push` - 数据库 schema 推送

## 4. Attention

- **Node.js 版本**: 必须使用 Node.js >= 20.0.0，推荐使用最新 LTS 版本
- **包管理器**: 项目使用 pnpm，不要使用 npm 或 yarn
- **AI API Key**: 至少配置一个 AI 提供商的 API Key 才能使用聊天功能
- **环境变量**: `.env.local` 文件已添加到 .gitignore，不会提交到版本控制
- **数据库文件**: `local.db` 文件会自动创建，不需要手动创建
- **端口占用**: 默认使用 3000 端口，如被占用会自动选择下一个可用端口
- **环境变量验证**: URL 类型的环境变量支持空字符串，系统会自动使用默认值
- **Windows 用户**: 在 WSL 环境下运行效果最佳，避免 Windows 路径问题
