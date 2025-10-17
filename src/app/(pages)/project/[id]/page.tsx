'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import * as Dialog from '@radix-ui/react-dialog'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = Number(params.id)

  // 状态管理
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportData, setExportData] = useState('')

  // tRPC hooks
  const { data: project, isLoading } = trpc.schemart.getProject.useQuery(
    { id: projectId },
    { enabled: !isNaN(projectId) },
  )

  const { data: tables } = trpc.schemart.getTablesByProject.useQuery(
    { projectId },
    { enabled: !isNaN(projectId) },
  )

  const exportProjectMutation = trpc.schemartTools.exportProject.useMutation({
    onSuccess: (data) => {
      setExportData(data.data)
      setIsExportDialogOpen(true)
    },
    onError: (error) => {
      console.error('导出失败:', error)
      alert(`导出失败: ${error.message}`)
    },
  })

  const generateSQLMutation = trpc.schemartTools.generateSQLDiff.useMutation()

  // 复制SQL到剪贴板
  const handleCopySQL = async (tableId: number) => {
    try {
      const result = await generateSQLMutation.mutateAsync({
        tableId,
        targetDatabaseType: 'postgresql',
      })
      await navigator.clipboard.writeText(result.sql)
      alert('SQL已复制到剪贴板!')
    } catch (error: any) {
      alert(`复制失败: ${error.message}`)
    }
  }

  // 导出项目
  const handleExportProject = () => {
    exportProjectMutation.mutate({ id: projectId })
  }

  // 复制导出数据
  const handleCopyExportData = async () => {
    await navigator.clipboard.writeText(exportData)
    alert('已复制到剪贴板!')
  }

  // 下载导出数据
  const handleDownloadExportData = () => {
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.name || 'project'}-export.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className='brutalist-container'>
        <div className='brutalist-card p-8'>
          <p className='brutalist-text'>加载中...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className='brutalist-container'>
        <div className='brutalist-card p-8'>
          <h1 className='brutalist-title text-red-500'>项目不存在</h1>
          <Link href='/' className='inline-block mt-4'>
            <button className='brutalist-button'>返回首页</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='brutalist-container'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <Link href='/' className='brutalist-text brutalist-text-secondary hover:text-black'>
            ← 返回项目列表
          </Link>
          <h1 className='brutalist-title mt-2'>{project.name}</h1>
          {project.description && (
            <p className='brutalist-text brutalist-text-secondary'>{project.description}</p>
          )}
        </div>
        <div className='flex gap-3'>
          <Link href={`/project/${projectId}/generate`}>
            <button className='brutalist-button brutalist-button-blue'>
              ✨ AI 生成表结构
            </button>
          </Link>
          <button
            className='brutalist-button brutalist-button-pink'
            onClick={handleExportProject}
            disabled={exportProjectMutation.isLoading}
          >
            📤 导出项目
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{tables?.length || 0}</div>
          <div className='brutalist-stat-label'>表数量</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>
            {tables?.reduce((acc, table) => acc + (table.id ? 1 : 0), 0) || 0}
          </div>
          <div className='brutalist-stat-label'>活跃表</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>
            {new Date(project.updatedAt * 1000).toLocaleDateString('zh-CN')}
          </div>
          <div className='brutalist-stat-label'>最后更新</div>
        </div>
      </div>

      {/* Tables List */}
      <div className='brutalist-card p-8'>
        <h2 className='brutalist-heading mb-6'>数据库表</h2>

        {tables && tables.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {tables.map((table) => (
              <div key={table.id} className='brutalist-card-sm p-6 hover:shadow-lg transition-shadow'>
                <h3 className='brutalist-heading text-lg mb-2'>{table.name}</h3>
                <p className='brutalist-text brutalist-text-secondary mb-4 text-sm'>
                  {table.comment || '无描述'}
                </p>
                <div className='flex gap-2'>
                  <Link href={`/table/${table.id}`} className='flex-1'>
                    <button className='brutalist-button brutalist-button-green w-full text-sm'>
                      查看详情
                    </button>
                  </Link>
                  <button
                    className='brutalist-button brutalist-button-blue text-sm px-3'
                    onClick={() => handleCopySQL(table.id)}
                    disabled={generateSQLMutation.isLoading}
                    title='复制CREATE SQL'
                  >
                    📋
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <p className='brutalist-text brutalist-text-secondary mb-4'>还没有任何表</p>
            <p className='brutalist-text mb-6'>使用AI快速生成表结构</p>
            <Link href={`/project/${projectId}/generate`}>
              <button className='brutalist-button brutalist-button-blue'>
                ✨ AI 生成表结构
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Export Dialog */}
      <Dialog.Root open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className='fixed inset-0 bg-black/50 z-40' />
          <Dialog.Content className='fixed left-1/2 top-1/2 z-50 grid w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white p-6 shadow-lg brutalist-card'>
            <Dialog.Title className='brutalist-heading text-lg'>导出项目数据</Dialog.Title>

            <textarea
              className='brutalist-input w-full h-96 font-mono text-sm resize-none'
              value={exportData}
              readOnly
            />

            <div className='flex justify-end gap-3'>
              <Dialog.Close asChild>
                <button className='brutalist-button'>关闭</button>
              </Dialog.Close>
              <button
                className='brutalist-button brutalist-button-blue'
                onClick={handleCopyExportData}
              >
                📋 复制
              </button>
              <button
                className='brutalist-button brutalist-button-green'
                onClick={handleDownloadExportData}
              >
                💾 下载
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

