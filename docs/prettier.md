## 代码格式化规范 (Prettier)

本项目使用 **Prettier** 进行代码格式化，确保团队成员的代码风格保持一致。

### Prettier 配置

项目根目录下的 `.prettierrc` 文件定义了格式化规则：

```json
{
  "printWidth": 80, // 每行最大字符数
  "tabWidth": 2, // 缩进宽度
  "useTabs": false, // 使用空格而非 Tab
  "semi": false, // 不使用分号
  "singleQuote": true, // 使用单引号
  "quoteProps": "as-needed", // 仅在需要时给对象属性加引号
  "jsxSingleQuote": true, // JSX 中使用单引号
  "trailingComma": "all", // 尽可能使用尾随逗号
  "bracketSpacing": true, // 对象字面量的括号间加空格
  "bracketSameLine": false, // JSX 标签的 > 不与最后一个属性同行
  "arrowParens": "always", // 箭头函数总是使用括号
  "endOfLine": "lf" // 使用 LF 换行符
}
```

### VS Code 配置

#### 1. 安装 Prettier 插件

在 VS Code 扩展市场搜索并安装 [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

#### 2. 配置自动格式化

**方法一：项目级配置（推荐）**

在项目根目录创建 `.vscode/settings.json` 文件：

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**方法二：全局配置**

打开 VS Code 设置（`Ctrl + ,` 或 `Cmd + ,`），搜索并配置以下选项：

- `Editor: Default Formatter` → 选择 `Prettier - Code formatter`
- `Editor: Format On Save` → 勾选启用
- `Editor: Format On Paste` → 可选，根据个人喜好

### 使用方式

#### 命令行格式化

```bash
# 格式化整个项目
pnpm format

# 检查格式化（不修改文件）
pnpm prettier --check .

# 格式化特定文件
pnpm prettier --write src/app/page.tsx
```

#### VS Code 快捷键

- **格式化当前文件**: `Shift + Alt + F` (Windows/Linux) 或 `Shift + Option + F` (macOS)
- **格式化选中代码**: `Ctrl + K, Ctrl + F` (Windows/Linux) 或 `Cmd + K, Cmd + F` (macOS)

### 与 ESLint 的集成

本项目已配置 `eslint-plugin-prettier` 和 `eslint-config-prettier`，确保 ESLint 与 Prettier 协同工作：

- **`eslint-plugin-prettier`**: 将 Prettier 规则作为 ESLint 规则运行
- **`eslint-config-prettier`**: 禁用所有与 Prettier 冲突的 ESLint 规则

运行 `pnpm lint` 时会同时检查代码质量（ESLint）和代码格式（Prettier）。

### 忽略文件

如需忽略特定文件或目录，可创建 `.prettierignore` 文件：

```
# 依赖
node_modules
.pnpm-store

# 构建产物
.next
out
dist
build

# 环境变量
.env*

# 其他
*.min.js
*.min.css
```
