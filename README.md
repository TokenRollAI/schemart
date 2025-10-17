# Schemart

🤖 AI驱动的数据库表结构管理工具

一个基于 AI 技术的智能数据库表结构设计和管理工具,让表结构设计变得简单高效。

## 核心特性

### 🤖 AI 智能生成表结构
- 使用自然语言描述需求,AI自动生成完整的表结构设计
- 支持 OpenAI、Claude、Gemini 多种AI模型
- 自动生成列定义、索引、注释等完整信息
- 智能区分基本字段(id, created_at, updated_at)和业务字段

### 📋 一键复制 CREATE SQL
- 快速生成标准的 CREATE TABLE SQL 语句
- 支持 MySQL、PostgreSQL、SQLite 多种数据库类型
- 包含完整的列定义、索引、注释
- 一键复制到剪贴板,直接使用

### 🗄️ 可视化表结构管理
- 清晰的表结构展示,基本字段和业务字段区分显示
- 完整的列信息:类型、注释、约束、默认值
- 索引管理:支持普通索引和唯一索引
- 表历史记录追踪

### 📤 项目导入导出
- 支持项目完整导出为 JSON 格式
- 一键导入已有项目
- 方便团队协作和项目备份
- 跨平台共享表结构设计

---

## 技术栈

- **前端框架**: Next.js 15.5 + React 19
- **API层**: tRPC (端到端类型安全)
- **数据库**: SQLite + Drizzle ORM
- **UI组件**: Radix UI + Neo-Brutalism 设计系统
- **AI集成**: Vercel AI SDK (支持 OpenAI、Claude、Gemini)
- **样式**: Tailwind CSS
- **验证**: Zod 4.x
- **包管理**: pnpm

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置AI提供商的API密钥:

```bash
cp .env.example .env
```

编辑 `.env` 文件,至少配置一个AI提供商的API密钥:

```env
# OpenAI (推荐)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# 或者使用 Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 或者使用 Gemini
GOOGLE_API_KEY=your_google_api_key_here
```

### 3. 初始化数据库

```bash
pnpm db:push
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

## 使用指南

### 创建项目

1. 在首页点击"新建项目"按钮
2. 输入项目名称和描述
3. 点击创建

### 使用AI生成表结构

1. 进入项目详情页
2. 点击"开始使用 AI 生成"按钮
3. 选择AI提供商(OpenAI/Claude/Gemini)
4. 用自然语言描述你的需求,例如:
   ```
   创建一个用户表,包含:
   - 用户名(唯一)
   - 邮箱(唯一)
   - 密码(加密)
   - 手机号
   - 头像URL
   - 用户状态(正常/禁用)
   - 注册时间
   - 最后登录时间

   需要为邮箱和手机号添加索引
   ```
5. AI将自动生成完整的表结构设计
6. 查看生成的表结构,确认无误后保存到项目

### 复制CREATE SQL

1. 在项目详情页的表卡片上,点击📋按钮
2. SQL语句将自动复制到剪贴板
3. 可以直接在数据库中执行

### 导入导出项目

**导出项目:**
1. 进入项目详情页
2. 点击"导出项目"按钮
3. 可以复制JSON或下载文件

**导入项目:**
1. 在首页点击"导入项目"按钮
2. 选择之前导出的JSON文件
3. 项目将被导入系统

## 数据库命令

```bash
# 推送schema到数据库(开发环境)
pnpm db:push

# 生成迁移文件
pnpm db:generate

# 运行迁移(生产环境)
pnpm db:migrate

# 打开数据库管理界面
pnpm db:studio
```

## 项目构建

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码格式化
pnpm format

# 代码检查
pnpm lint
```
