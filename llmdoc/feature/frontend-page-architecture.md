# 前端页面架构

## 1. Purpose

描述 Schemart 项目的前端页面架构设计,包含 Next.js App Router 路由结构、页面组件层级、交互流程和状态管理,为前端开发提供完整的架构参考。

## 2. How it Works

### 页面路由结构

项目采用 Next.js 15 App Router 文件系统路由,通过路由组实现前后端分离。

**核心路由架构:**
```
src/app/
├── (pages)/           # 前端页面路由组
│   ├── layout.tsx     # 根布局
│   ├── page.tsx       # 主页 (/)
│   ├── project/       # 项目管理
│   │   └── [id]/      # 项目详情 (/project/:id)
│   │       ├── page.tsx
│   │       └── generate/
│   │           └── page.tsx  # AI生成 (/project/:id/generate)
│   └── table/         # 表管理
│       └── [id]/      # 表详情 (/table/:id)
│           ├── page.tsx
│           └── edit/
│               └── page.tsx   # 表编辑 (/table/:id/edit)
└── (server)/          # 服务端API路由组
    └── api/trpc/      # tRPC端点
```

### 主页面设计

#### 主页 (/)

**页面功能:**
- 展示项目列表和统计信息
- 创建新项目（模态框）
- 导入项目（JSON 文件）
- 删除项目

**核心交互流程:**
```
用户访问主页
  ↓
加载项目列表 (trpc.schemart.getProjects.useQuery)
  ↓
展示统计卡片 (项目数、表数)
  ↓
用户点击"新建项目"
  ↓
打开创建对话框
  ↓
用户输入项目信息
  ↓
提交创建请求 (trpc.schemart.createProject.useMutation)
  ↓
成功后跳转到项目详情页
```

**数据流设计:**
```typescript
const { data: projects } = trpc.schemart.getProjects.useQuery()

const createProjectMutation = trpc.schemart.createProject.useMutation({
  onSuccess: (data) => {
    router.push(`/project/${data.id}`)
  },
})
```

#### 项目详情页 (/project/[id])

**页面功能:**
- 显示项目信息
- 展示表列表
- AI 生成表结构入口
- 创建新表
- 编辑/删除表
- 导出项目

**核心交互流程:**
```
用户访问项目详情
  ↓
加载项目信息 (trpc.schemart.getProject.useQuery)
  ↓
加载表列表 (trpc.schemart.getTables.useQuery)
  ↓
展示表卡片（包含列数、索引数）
  ↓
用户点击"AI生成"
  ↓
跳转到 AI 生成页面
  ↓
用户点击"新建表"
  ↓
打开创建对话框
  ↓
用户输入表信息
  ↓
提交创建请求 (trpc.schemart.createTable.useMutation)
  ↓
刷新表列表
```

**状态管理:**
```typescript
// 项目信息
const { data: project } = trpc.schemart.getProject.useQuery({ id: projectId })

// 表列表
const { data: tables } = trpc.schemart.getTables.useQuery({ projectId })

// 创建表
const createTableMutation = trpc.schemart.createTable.useMutation({
  onSuccess: () => {
    utils.schemart.getTables.invalidate()
  },
})

// 导出项目
const exportProjectMutation = trpc.schemartTools.exportProject.useMutation({
  onSuccess: (data) => {
    downloadJSON(data, `${project.name}.json`)
  },
})
```

#### AI 生成页面 (/project/[id]/generate)

**页面功能:**
- 输入需求描述
- 自动加载项目表作为上下文
- AI 生成表结构
- 预览生成结果
- 选择保存的表
- 批量创建表

**阶段式交互设计:**

**阶段1: 输入描述**
```jsx
{!generatedTables.length ? (
  <div className='brutalist-card p-8'>
    {/* 上下文提示 */}
    {tables && tables.length > 0 && (
      <div className='brutalist-card-sm p-4 bg-blue-50'>
        <p>💡 项目中的所有现有表（{tables.length} 个）将自动作为参考</p>
      </div>
    )}

    {/* 输入表单 */}
    <textarea
      value={aiDescription}
      onChange={(e) => setAiDescription(e.target.value)}
      className='brutalist-input h-48'
      placeholder='请描述您需要的表结构...'
    />

    {/* 生成按钮 */}
    <button
      onClick={handleGenerate}
      className='brutalist-button brutalist-button-blue'
      disabled={generateTableMutation.isPending}
    >
      {generateTableMutation.isPending ? '正在生成...' : '生成表结构'}
    </button>
  </div>
) : (
  // 阶段2: 显示结果
)}
```

**阶段2: 显示结果**
```jsx
<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
  {/* 左侧：表选择器 */}
  <div className='lg:col-span-1'>
    {generatedTables.map((table, index) => (
      <button
        onClick={() => setSelectedTableIndex(index)}
        className={selectedTableIndex === index ? 'active' : ''}
      >
        {table.tableName}
      </button>
    ))}
  </div>

  {/* 右侧：表详情 */}
  <div className='lg:col-span-3'>
    <div className='brutalist-card p-6'>
      <h2>{selectedTable.tableName}</h2>
      <p>{selectedTable.tableComment}</p>

      {/* 字段列表 */}
      <table className='brutalist-table'>
        <thead>
          <tr>
            <th>字段名</th>
            <th>类型</th>
            <th>注释</th>
          </tr>
        </thead>
        <tbody>
          {selectedTable.columns.map(col => (
            <tr key={col.name}>
              <td>{col.name}</td>
              <td>{col.type}</td>
              <td>{col.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 索引信息 */}
      {selectedTable.indexes?.length > 0 && (
        <div>
          <h3>索引</h3>
          {selectedTable.indexes.map(idx => (
            <div key={idx.name}>
              <span>{idx.name}</span>
              <span>{idx.columns.join(', ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>

{/* 保存按钮 */}
<button
  onClick={handleSaveTables}
  className='brutalist-button brutalist-button-green'
>
  保存所有表
</button>
```

**数据流设计:**
```typescript
// AI 生成
const generateTableMutation = trpc.schemartAI.generateTable.useMutation({
  onSuccess: (data) => {
    setGeneratedTables(data.tables)
    setSelectedTableIndex(0)
  },
})

// 批量保存表
const handleSaveTables = async () => {
  for (const table of generatedTables) {
    await createTableMutation.mutateAsync({
      projectId,
      name: table.tableName,
      comment: table.tableComment,
      columns: table.columns,
      indexes: table.indexes,
    })
  }
  router.push(`/project/${projectId}`)
}
```

#### 表详情页 (/table/[id])

**页面功能:**
- 展示表基本信息
- 分类显示字段（业务字段/基本字段）
- 展示索引信息
- 生成 SQL
- 编辑表

**分类展示策略:**
```typescript
const basicFields = table.columns.filter((col) => col.isBasicField)
const businessFields = table.columns.filter((col) => !col.isBasicField)

// 业务字段优先显示
{businessFields.length > 0 && (
  <div className='brutalist-card p-6 mb-6'>
    <h2>业务字段</h2>
    {/* 业务字段表格 */}
  </div>
)}

// 基本字段次要显示（灰色背景区分）
{basicFields.length > 0 && (
  <div className='brutalist-card p-6' style={{ backgroundColor: '#f9f9f9' }}>
    <h2>基本字段</h2>
    {/* 基本字段表格 */}
  </div>
)}
```

#### 表编辑页 (/table/[id]/edit)

**页面功能:**
- 编辑表名和注释
- 添加/删除/编辑列
- 保护基本字段（id、created_at、updated_at）
- 验证数据完整性
- 保存修改

**核心交互流程:**
```
用户访问编辑页
  ↓
加载表完整信息 (trpc.schemart.getTableWithDetails.useQuery)
  ↓
初始化编辑状态
  ↓
用户修改表信息
  ↓
用户添加/删除/编辑字段
  ↓
系统验证基本字段保护
  ↓
用户提交保存
  ↓
验证数据 (Zod schema)
  ↓
提交更新请求 (trpc.schemart.updateTable.useMutation)
  ↓
成功后跳转到表详情页
```

**状态管理:**
```typescript
// 表信息
const { data: table } = trpc.schemart.getTableWithDetails.useQuery({ id: tableId })

// 编辑状态
const [tableName, setTableName] = useState(table.name)
const [tableComment, setTableComment] = useState(table.comment)
const [columns, setColumns] = useState(table.columns)

// 字段操作
const handleAddColumn = () => {
  setColumns([...columns, newColumn])
}

const handleDeleteColumn = (index: number) => {
  // 检查是否为基本字段
  if (columns[index].isBasicField) {
    alert('基本字段不能删除')
    return
  }
  setColumns(columns.filter((_, i) => i !== index))
}

// 提交更新
const updateTableMutation = trpc.schemart.updateTable.useMutation({
  onSuccess: () => {
    router.push(`/table/${tableId}`)
  },
})
```

### 加载状态处理

**全局加载模式:**
```typescript
const { data, isLoading, error } = trpc.schemart.getProjects.useQuery()

if (isLoading) {
  return (
    <div className='brutalist-container'>
      <div className='brutalist-card p-8 text-center'>
        <p className='brutalist-text'>加载中...</p>
      </div>
    </div>
  )
}

if (error) {
  return (
    <div className='brutalist-container'>
      <div className='brutalist-card p-8 text-center'>
        <p className='brutalist-text text-red-600'>
          加载失败: {error.message}
        </p>
      </div>
    </div>
  )
}
```

**按钮 Pending 状态:**
```typescript
<button
  onClick={handleSubmit}
  disabled={mutation.isPending}
  className='brutalist-button brutalist-button-blue'
>
  {mutation.isPending ? '处理中...' : '提交'}
</button>
```

### 错误处理

**统一错误处理:**
```typescript
const createProjectMutation = trpc.schemart.createProject.useMutation({
  onError: (error) => {
    alert(`创建失败: ${error.message}`)
  },
  onSuccess: (data) => {
    router.push(`/project/${data.id}`)
  },
})
```

## 3. Relevant Code Modules

### 页面组件
- `src/app/(pages)/page.tsx` - 主页实现
- `src/app/(pages)/project/[id]/page.tsx` - 项目详情页
- `src/app/(pages)/project/[id]/generate/page.tsx` - AI 生成页面
- `src/app/(pages)/table/[id]/page.tsx` - 表详情页
- `src/app/(pages)/table/[id]/edit/page.tsx` - 表编辑页

### 布局组件
- `src/app/(pages)/layout.tsx` - 根布局组件
- `src/app/(pages)/not-found.tsx` - 404 页面

### 提供者组件
- `src/components/providers/TrpcProvider.tsx` - tRPC 和 React Query 集成

### 样式文件
- `src/app/(pages)/globals.css` - 全局样式和设计系统

## 4. Attention

- 所有页面都需要使用 tRPC hooks 进行数据获取,确保类型安全
- 表单验证要在客户端和服务端双重进行
- 路由跳转要使用 Next.js useRouter,确保客户端路由工作正常
- 加载和错误状态要有明确的 UI 反馈
- 基本字段（id、created_at、updated_at）禁止删除和修改
- AI 生成页面的上下文表自动加载,无需用户手动选择
- 表编辑采用删除重建策略,需要确保原子性操作
- 导出功能生成的 JSON 文件需要包含版本信息