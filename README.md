# fast-mvp

AI MVP应用的通用template

---

## 前置准备

在Claude code中

```
# Add TokenRoll plugin marketplace
/plugin marketplace add https://github.com/TokenRollAI/cc-plugin

# Install tr plugin
/plugin install tr@cc-plugin
```

重新启动claude code

## 项目结构与开发规范

本项目遵循 Next.js (App Router) 的标准开发规范，旨在提高代码的可读性、可维护性和团队协作效率。

### 核心目录结构

```
/src
├── app/ # 路由与页面
│ ├── (server)/ # [后端] 服务端路由 (API, webhooks, etc.)
│ │ └── api/
│ │ └── [..path]/
│ │ └── route.ts
│ ├── (pages)/ # [前端] 页面组件
│ │ ├── dashboard/
│ │ │ └── page.tsx
│ │ └── layout.tsx
│ ├── globals.css # 全局样式
│ └── layout.tsx # 根布局
├── components/ # [前端] 全局共享组件
│ ├── ui/ # 基础 UI 组件 (Button, Input, Card...)
│ ├── features/ # 特定功能的业务组件 (UserProfile, ProductCard...)
│ └── providers/ # Provider组件 (tRPC, Theme等)
├── lib/ # 公共库与辅助函数
│ ├── api/ # 封装的客户端请求模块
│ ├── schema/ # [DTO] Zod schemas 定义模块
│ │ └── hello.ts # Hello模块的输入验证schema
│ └── trpc/ # tRPC客户端配置
├── server/ # [后端] 服务端业务逻辑
│ ├── trpc.ts # tRPC初始化配置
│ └── routers/ # tRPC路由定义
│     ├── _app.ts # 根路由
│     └── hello.ts # Hello模块路由
├── db/ # 数据库相关
│ ├── db.ts # 数据库连接实例
│ └── schema/ # 数据表定义
│     └── hello.ts # Hello表结构
├── types/ # 全局 TypeScript 类型定义
└── index.d.ts # 全局类型声明文件
```

### 规范详解

#### 1. 前端开发 (`/src/app/(pages)`)

- **路由定义**: Next.js App Router 采用**基于文件夹的路由**。每个需要映射到 URL 路径的页面都应在 `/src/app/(pages)` 目录下创建一个对应的文件夹。
- **页面组件**: 每个路由文件夹内的 `page.tsx` 文件是该路由的**主页面组件**。
- **布局组件**: `layout.tsx` 文件用于定义该路由及其子路由共享的 UI 布局。

#### 2. 后端开发 (`/src/app/(server)`)

- **API 路由**: 所有后端 API 端点都定义在 `/src/app/(server)/api` 目录下。我们使用 Next.js 的 Route Handlers。
- **文件命名**: 每个 API 端点对应一个 `route.ts` 文件。例如，`POST /api/users` 的处理逻辑应位于 `/src/app/(server)/api/users/route.ts` 中。

#### 3. 客户端请求 (`/src/lib/api`)

- **封装**: 所有从前端发起的 API 请求（例如使用 `fetch`）都应封装在 `/src/lib/api` 模块的函数里。
- **好处**: 便于统一管理 API 端点、请求头、错误处理和加载状态。
-

#### 4. 数据传输对象 (DTO / Schema) (`/src/lib/schema`)

- **定义位置**: 所有用于前后端数据校验的 Zod Schema（可以视为 DTO）都应统一存放在 `/src/lib/schema` 模块中。
- **用途**: 这些 Schema 用于验证 tRPC 的输入参数，确保数据在系统中的类型安全。
- **命名规范**: 每个业务模块的 schema 应该独立成文件，如 `hello.ts`、`user.ts` 等。
- **导出规范**: 使用对象形式组织相关的 schema，便于管理和使用。

#### 5. 全局类型 (`/src/types`)

- **定义**: 项目中通用的、非 Zod Schema 的 TypeScript 类型或接口，应定义在 `/src/types` 目录下。

---

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 数据库初始化

本项目使用 SQLite 数据库和 Drizzle ORM。首次运行前需要初始化数据库：

```bash
# 推送数据库结构到本地数据库文件
pnpm db:push

# 可选：打开 Drizzle Studio 查看数据库
pnpm db:studio
```

**数据库相关命令说明：**

- `pnpm db:push` - 将 schema 推送到数据库（开发环境推荐）
- `pnpm db:generate` - 生成迁移文件
- `pnpm db:migrate` - 运行迁移文件（生产环境推荐）
- `pnpm db:studio` - 启动 Drizzle Studio 数据库管理界面

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3002](http://localhost:3002) 查看应用。

### 4. 项目构建

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```
