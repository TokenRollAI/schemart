'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import * as Dialog from '@radix-ui/react-dialog'

export default function HomePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 状态管理
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  // tRPC hooks
  const {
    data: projects,
    isLoading,
    refetch,
  } = trpc.schemart.getAllProjects.useQuery({})

  const createProjectMutation = trpc.schemart.createProject.useMutation({
    onSuccess: (data) => {
      console.log('项目创建成功:', data)
      setIsCreateDialogOpen(false)
      setNewProjectName('')
      setNewProjectDescription('')
      refetch()
      // 跳转到项目详情页
      router.push(`/project/${data.id}`)
    },
    onError: (error) => {
      console.error('创建项目失败:', error)
      alert(`创建项目失败: ${error.message}`)
    },
  })

  const deleteProjectMutation = trpc.schemart.deleteProject.useMutation({
    onSuccess: () => {
      console.log('项目删除成功')
      refetch()
    },
    onError: (error) => {
      console.error('删除项目失败:', error)
      alert(`删除项目失败: ${error.message}`)
    },
  })

  const importProjectMutation = trpc.schemartTools.importProject.useMutation({
    onSuccess: (data) => {
      console.log('项目导入成功:', data)
      alert(`项目导入成功: ${data.message}`)
      refetch()
    },
    onError: (error) => {
      console.error('导入项目失败:', error)
      alert(`导入项目失败: ${error.message}`)
    },
  })

  // 处理创建项目
  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      alert('请输入项目名称')
      return
    }

    createProjectMutation.mutate({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
    })
  }

  // 处理删除项目
  const handleDeleteProject = (projectId: number, projectName: string) => {
    if (!confirm(`确定要删除项目 "${projectName}" 吗？此操作不可撤销。`)) {
      return
    }

    deleteProjectMutation.mutate({ id: projectId })
  }

  // 处理文件导入
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        importProjectMutation.mutate({ data: content })
      } catch (error) {
        alert('文件读取失败，请确保文件格式正确')
      }
    }
    reader.readAsText(file)

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 计算统计数据
  const totalProjects = projects?.length || 0
  const totalTables =
    projects?.reduce((acc, project) => acc + (project.tableCount || 0), 0) || 0

  return (
    <div className='brutalist-container'>
      {/* Title */}
      <h1 className='brutalist-title'>Schemart - 数据库表结构管理</h1>

      {/* Statistics Cards Row */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{totalProjects}</div>
          <div className='brutalist-stat-label'>项目总数</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{totalTables}</div>
          <div className='brutalist-stat-label'>表数量</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>
            {projects?.length > 0
              ? new Date(
                  Math.max(...projects.map((p) => p.updatedAt)) * 1000,
                ).toLocaleDateString('zh-CN')
              : '-'}
          </div>
          <div className='brutalist-stat-label'>最后更新</div>
        </div>
      </div>

      {/* Main Content */}
      <div className='brutalist-card p-8'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='brutalist-heading'>项目列表</h2>
          <div className='flex gap-3'>
            <button
              className='brutalist-button brutalist-button-blue'
              onClick={() => setIsCreateDialogOpen(true)}
            >
              ✨ 新建项目
            </button>
            <button
              className='brutalist-button brutalist-button-pink'
              onClick={() => fileInputRef.current?.click()}
            >
              📁 导入项目
            </button>
            <input
              ref={fileInputRef}
              type='file'
              accept='.json'
              onChange={handleFileImport}
              className='hidden'
            />
          </div>
        </div>

        {isLoading ? (
          <div className='text-center py-12'>
            <p className='brutalist-text'>加载项目中...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <table className='brutalist-table'>
            <thead>
              <tr>
                <th>项目名称</th>
                <th>描述</th>
                <th>表数量</th>
                <th>创建时间</th>
                <th>最后更新</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className='font-semibold'>
                    <Link href={`/project/${project.id}`} className='brutalist-text underline-offset-4 hover:underline'>
                      {project.name}
                    </Link>
                  </td>
                  <td className='brutalist-text-secondary'>
                    {project.description || '-'}
                  </td>
                  <td>
                    <span className='brutalist-badge brutalist-badge-blue'>
                      {project.tableCount || 0} 个表
                    </span>
                  </td>
                  <td>
                    {new Date(project.createdAt * 1000).toLocaleDateString(
                      'zh-CN',
                    )}
                  </td>
                  <td>
                    {new Date(project.updatedAt * 1000).toLocaleDateString(
                      'zh-CN',
                    )}
                  </td>
                  <td>
                    <div className='flex gap-2'>
                      <Link href={`/project/${project.id}`}>
                        <button className='brutalist-button brutalist-button-green text-sm px-3 py-1'>
                          查看
                        </button>
                      </Link>
                      <button
                        className='brutalist-button brutalist-button-pink text-sm px-3 py-1'
                        onClick={() =>
                          handleDeleteProject(project.id, project.name)
                        }
                        disabled={deleteProjectMutation.isPending}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='text-center py-12'>
            <p className='brutalist-text brutalist-text-secondary mb-4'>
              还没有任何项目
            </p>
            <p className='brutalist-text mb-6'>
              创建您的第一个数据库表结构管理项目
            </p>
            <button
              className='brutalist-button brutalist-button-blue'
              onClick={() => setIsCreateDialogOpen(true)}
            >
              ✨ 创建项目
            </button>
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog.Root
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className='fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
          <Dialog.Content className='fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] brutalist-card sm:rounded-lg'>
            <Dialog.Title className='brutalist-heading text-lg'>
              创建新项目
            </Dialog.Title>

            <div className='space-y-4'>
              <div>
                <label className='brutalist-text block mb-2 font-semibold'>
                  项目名称 *
                </label>
                <input
                  type='text'
                  className='brutalist-input w-full'
                  placeholder='输入项目名称'
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label className='brutalist-text block mb-2 font-semibold'>
                  项目描述
                </label>
                <textarea
                  className='brutalist-input w-full resize-none'
                  placeholder='输入项目描述（可选）'
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>

            <div className='flex justify-end gap-3 pt-4'>
              <Dialog.Close asChild>
                <button className='brutalist-button'>取消</button>
              </Dialog.Close>
              <button
                className='brutalist-button brutalist-button-blue'
                onClick={handleCreateProject}
                disabled={
                  createProjectMutation.isPending || !newProjectName.trim()
                }
              >
                {createProjectMutation.isPending ? (
                  <span className='flex items-center gap-3'>
                    <span className='brutalist-loader sm'>
                      <span className='brutalist-loader-dot' />
                      <span className='brutalist-loader-dot' />
                      <span className='brutalist-loader-dot' />
                    </span>
                    <span>创建中...</span>
                  </span>
                ) : (
                  '创建项目'
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Features Grid */}
      <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='brutalist-card-sm p-6'>
          <h3 className='brutalist-heading text-lg'>🗄️ 表结构管理</h3>
          <p className='brutalist-text brutalist-text-secondary'>
            可视化管理数据库表结构，支持列、索引、注释等完整配置。
          </p>
        </div>
        <div className='brutalist-card-sm p-6'>
          <h3 className='brutalist-heading text-lg'>🤖 AI 智能生成</h3>
          <p className='brutalist-text brutalist-text-secondary'>
            使用AI技术自动生成表结构，提高开发效率。
          </p>
        </div>
        <div className='brutalist-card-sm p-6'>
          <h3 className='brutalist-heading text-lg'>📤 导入导出</h3>
          <p className='brutalist-text brutalist-text-secondary'>
            支持项目导入导出，方便团队协作和项目备份。
          </p>
        </div>
        <div className='brutalist-card-sm p-6'>
          <h3 className='brutalist-heading text-lg'>🔄 版本控制</h3>
          <p className='brutalist-text brutalist-text-secondary'>
            完整的变更历史记录，追踪表结构的每次修改。
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className='mt-12 text-center'>
        <p className='brutalist-text brutalist-text-secondary'>
          Schemart - 让数据库表结构管理更简单
        </p>
      </footer>
    </div>
  )
}
