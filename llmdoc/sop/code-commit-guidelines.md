# 代码提交规范

## 1. Purpose

确保 Fast MVP 项目的代码提交历史清晰、一致和可追溯，方便团队协作和问题定位，维护高质量的代码仓库。

## 2. How it Works / Step-by-Step Guide

### 步骤 1: 代码提交前检查 (必需)

1. **运行代码格式化**

   ```bash
   pnpm format
   ```

2. **运行 ESLint 检查**

   ```bash
   pnpm lint
   ```

3. **验证 TypeScript 类型**

   ```bash
   npx tsc --noEmit
   ```

4. **本地测试**
   ```bash
   pnpm dev  # 启动开发服务器测试功能
   ```

### 步骤 2: 提交信息格式规范

**标准格式:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型 (必需):**

- `feat`: 新功能 (feature)
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整 (不影响功能)
- `refactor`: 代码重构 (既非新增功能也非修复 Bug)
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动
- `build`: 构建系统或外部依赖更新
- `ci`: CI 配置文件和脚本变动

**Scope 范围 (可选):**

- `server`: 服务端相关
- `client`: 客户端相关
- `ui`: UI 组件相关
- `api`: API 接口相关
- `db`: 数据库相关
- `config`: 配置文件相关
- `ai`: AI 功能相关
- `docs`: 文档相关
- `deps`: 依赖相关

**Subject 主题 (必需):**

- 简洁描述变更内容
- 使用祈使句
- 首字母小写
- 不加句号
- 长度不超过 50 字符

**示例:**

```bash
# 项目实际提交示例
强化文档：添加关键开发规则和主题系统指南
优化项目架构和开发体验
添加devcontainer
炫酷的MagicUI的效果以及更新AGENTS.md
彻底移除CopilotKit

# 良好示例
feat(ai): 添加 Claude 提供商支持
fix(server): 修复 tRPC 路由类型错误
docs(readme): 更新项目安装说明
refactor(ui): 重构主题系统实现
perf(db): 优化数据库查询性能
chore(deps): 升级 Next.js 到 15.5.2

# 不良示例
Update code  # 过于模糊
Fix bug.  # 缺少具体信息
added new feature for ai chat  # 格式不规范
```

### 步骤 3: 提交详细描述 (Body)

**何时需要 Body:**

- 变更较为复杂
- 需要说明变更原因
- 有破坏性变更 (BREAKING CHANGE)

**Body 格式:**

```
feat(ai): 添加多提供商流式响应支持

实现了统一的流式响应接口，支持 OpenAI、Claude 和 Gemini。
主要变更：
- 在 AI 提供商工厂中添加流式方法
- 更新 tRPC 路由支持流式响应
- 重构前端组件以支持实时显示

解决了用户在长文本生成时需要等待的问题，提升了用户体验。
```

### 步骤 4: 特殊标记 (Footer)

**Breaking Changes (破坏性变更):**

```
feat(api): 重构 tRPC 路由结构

BREAKING CHANGE: 所有路由命名从驼峰改为短横线格式
- hello.sayHello -> hello.say-hello
- chat.sendMessage -> chat.send-message

迁移指南见文档: docs/migration-v2.md
```

**关联 Issue:**

```
fix(ui): 修复主题切换时闪烁问题

修复了在切换深色/浅色主题时页面闪烁的问题。

Closes #123
Related to #124
```

### 步骤 5: 实际提交流程

**单文件或相关文件提交:**

```bash
# 1. 查看变更
git status
git diff

# 2. 添加文件
git add src/lib/ai/providers/new-provider.ts

# 3. 提交
git commit -m "feat(ai): 添加新的 AI 提供商支持"
```

**多文件提交 (功能完整):**

```bash
# 1. 添加所有相关文件
git add src/server/routers/feature.ts
git add src/lib/schema/feature.ts
git add src/components/feature/

# 2. 提交完整功能
git commit -m "feat(feature): 实现新功能模块

添加了完整的功能实现，包括：
- tRPC 路由定义
- Zod 验证 schema
- 前端展示组件

测试通过，准备部署。"
```

**临时保存工作:**

```bash
# 使用 git stash 临时保存
git stash save "WIP: 正在开发新功能"

# 恢复工作
git stash pop
```

### 步骤 6: 提交后操作

**推送到远程:**

```bash
# 推送当前分支
git push origin feature/your-feature

# 首次推送
git push -u origin feature/your-feature
```

**创建 Pull Request:**

1. 访问 GitHub/GitLab 仓库
2. 点击 "New Pull Request"
3. 填写 PR 描述 (参考提交信息格式)
4. 关联相关 Issue
5. 请求代码审查

### 步骤 7: 常见场景处理

**修改上次提交:**

```bash
# 添加遗漏的文件
git add forgotten-file.ts
git commit --amend --no-edit

# 修改提交信息
git commit --amend -m "feat(feature): 更新的提交信息"
```

**合并多个提交:**

```bash
# 交互式 rebase
git rebase -i HEAD~3

# 在编辑器中将要合并的提交标记为 squash
# 保存退出，编辑合并后的提交信息
```

**撤销提交:**

```bash
# 撤销最近一次提交 (保留变更)
git reset --soft HEAD~1

# 撤销最近一次提交 (丢弃变更)
git reset --hard HEAD~1
```

## 3. Relevant Code Modules

### 3.1 代码质量工具

- `eslint.config.mjs` - ESLint 配置，使用 Next.js 核心配置和 Prettier 集成
- `.prettierrc` - Prettier 配置，统一代码格式化规则
- `package.json` - 包含 format 和 lint 脚本，使用 pnpm 包管理器

### 3.2 TypeScript 配置

- `tsconfig.json` - TypeScript 编译配置，启用严格模式和增量编译

### 3.3 Git 配置

- `.gitignore` - 忽略文件配置
- `.git/hooks/` - Git hooks（当前仅包含默认示例文件，无自定义 hooks）

## 4. Attention

### 项目特定要求

- **提交风格**: 当前项目使用中文描述性提交信息，如"强化文档：添加关键开发规则和主题系统指南"
- **包管理器**: 严格使用 `pnpm`，避免使用 npm 或 yarn
- **代码格式化**: 提交前必须运行 `pnpm format`
- **类型检查**: 使用 `npx tsc --noEmit` 验证 TypeScript 类型
- **Git Hooks**: 项目当前未配置自定义 Git hooks，需要手动执行检查

### 通用最佳实践

- **提交频率**: 功能完成后及时提交，避免大量变更积累
- **原子提交**: 每次提交应该是一个完整的、可独立理解的变更
- **提交信息语言**: 中文或英文保持一致，项目当前使用中文
- **敏感信息**: 绝不提交 API Keys、密码等敏感信息
- **大文件**: 避免提交大型二进制文件，使用 Git LFS 管理
- **主分支保护**: 不要直接向 main/master 分支推送
- **代码审查**: 所有代码变更应通过 Pull Request 进行审查

### 配置说明

- **ESLint**: 集成 Prettier 配置，使用 Next.js 核心规则
- **Prettier**: 统一代码格式，2空格缩进，单引号，无分号
- **TypeScript**: 严格模式，增量编译，路径别名 `@/*` 指向 `./src/*`
