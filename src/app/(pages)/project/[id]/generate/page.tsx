'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { BackLinks } from '@/components/navigation/BackLinks'

export default function GenerateTablePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)

  // 状态管理
  const [aiDescription, setAiDescription] = useState('')
  const [generatedTables, setGeneratedTables] = useState<any[]>([])
  const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null)

  // tRPC hooks
  const { data: project } = trpc.schemart.getProject.useQuery(
    { id: projectId },
    { enabled: !isNaN(projectId) },
  )

  const { data: tables, refetch: refetchTables } = trpc.schemart.getTablesByProject.useQuery(
    { projectId },
    { enabled: !isNaN(projectId) },
  )

  const generateTableMutation = trpc.schemartAI.generateTableFromDescription.useMutation({
    onSuccess: (data) => {
      console.log('AI生成成功:', data)
      setGeneratedTables(data.tables || [])
      if (data.tables && data.tables.length > 0) {
        setSelectedTableIndex(0)
      }
    },
    onError: (error) => {
      console.error('AI生成失败:', error)
      alert(`AI生成失败: ${error.message}`)
    },
  })

  const createTableMutation = trpc.schemart.createTable.useMutation({
    onSuccess: () => {
      alert('表创建成功!')
      refetchTables()
      router.push(`/project/${projectId}`)
    },
    onError: (error) => {
      console.error('创建表失败:', error)
      alert(`创建表失败: ${error.message}`)
    },
  })

  // 处理AI生成
  const handleAIGenerate = () => {
    if (!aiDescription.trim()) {
      alert('请输入表结构描述')
      return
    }

    // 自动使用项目中的所有表作为上下文
    const allTableIds = tables?.map((t) => t.id) || []

    generateTableMutation.mutate({
      projectId,
      description: aiDescription.trim(),
      provider: 'openai',
      contextTableIds: allTableIds.length > 0 ? allTableIds : undefined,
    })
  }

  // 保存生成的表
  const handleSaveGeneratedTable = () => {
    if (selectedTableIndex === null || !generatedTables[selectedTableIndex]) {
      alert('请选择要保存的表')
      return
    }

    const table = generatedTables[selectedTableIndex]
    createTableMutation.mutate({
      projectId,
      name: table.name,
      comment: table.comment,
      columns: table.columns,
      indexes: table.indexes || [],
    })
  }

  const selectedTable = selectedTableIndex !== null ? generatedTables[selectedTableIndex] : null

  return (
    <div className='brutalist-container'>
      {/* 头部 */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <BackLinks previousHref={`/project/${projectId}`} />
          <h1 className='brutalist-title mt-2'>🤖 AI 智能生成表结构</h1>
          {project?.name && (
            <p className='brutalist-text brutalist-text-secondary'>项目: {project.name}</p>
          )}
        </div>
      </div>

      {/* 加载遮罩层 */}
      {generateTableMutation.isPending && (
        <div className='brutalist-loading-mask'>
          <div className='brutalist-loading-panel'>
            <div className='brutalist-loader'>
              <span className='brutalist-loader-dot' />
              <span className='brutalist-loader-dot' />
              <span className='brutalist-loader-dot' />
            </div>
            <p className='brutalist-loading-title'>AI 正在生成表结构</p>
            <p className='brutalist-loading-subtitle'>请稍候，这可能需要几秒钟</p>
          </div>
        </div>
      )}

      {!generatedTables.length ? (
        // 输入描述阶段
        <div className='brutalist-card p-8'>
          <div className='space-y-6'>
            {tables && tables.length > 0 && (
              <div className='brutalist-notice-card p-4'>
                <p className='brutalist-text brutalist-text-secondary text-sm'>
                  💡 <strong>提示：</strong>项目中的所有现有表（{tables.length} 个）将自动作为参考，帮助AI理解您的设计风格
                </p>
              </div>
            )}

            <div>
              <label className='brutalist-text block mb-2 font-semibold'>
                描述您的需求 *
              </label>
              <textarea
                className='brutalist-input w-full resize-none'
                placeholder='例如：创建一个用户表，包含用户名、邮箱、密码、手机号、注册时间等字段'
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                rows={12}
              />
            </div>

            <div className='flex justify-end gap-3'>
              <Link href={`/project/${projectId}`}>
                <button className='brutalist-button' disabled={generateTableMutation.isPending}>
                  取消
                </button>
              </Link>
              <button
                className={`brutalist-button brutalist-button-blue ${generateTableMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleAIGenerate}
                disabled={generateTableMutation.isPending || !aiDescription.trim()}
              >
                {generateTableMutation.isPending ? (
                  <span className='flex items-center gap-3'>
                    <span className='brutalist-loader sm'>
                      <span className='brutalist-loader-dot' />
                      <span className='brutalist-loader-dot' />
                      <span className='brutalist-loader-dot' />
                    </span>
                    <span>生成中...</span>
                  </span>
                ) : (
                  '✨ 生成表结构'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // 显示生成结果阶段
        <div className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
            {/* 左侧：表选择器 */}
            <div className='lg:col-span-1'>
              <div className='brutalist-card p-6'>
                <h3 className='brutalist-heading mb-4'>生成的表</h3>
                <div className='space-y-2'>
                  {generatedTables.map((table, index) => (
                    <button
                      key={index}
                      className={`w-full text-left brutalist-button ${selectedTableIndex === index ? 'brutalist-button-blue' : ''}`}
                      onClick={() => setSelectedTableIndex(index)}
                    >
                      {table.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：表结构详情 */}
            <div className='lg:col-span-3'>
              {selectedTable && (
                <div className='brutalist-card p-8 space-y-6'>
                  <div>
                    <h2 className='brutalist-heading text-xl mb-2'>{selectedTable.name}</h2>
                    <p className='brutalist-text brutalist-text-secondary'>
                      {selectedTable.comment}
                    </p>
                  </div>

                  <div>
                    <h3 className='brutalist-heading mb-3'>列定义</h3>
                    <div className='overflow-x-auto'>
                      <table className='brutalist-table'>
                        <thead>
                          <tr>
                            <th>列名</th>
                            <th>类型</th>
                            <th>注释</th>
                            <th>属性</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTable.columns?.map((col: any, idx: number) => (
                            <tr key={idx} className={col.isBasicField ? 'brutalist-basic-row' : undefined}>
                              <td className='font-mono'>{col.name}</td>
                              <td className='font-mono'>{col.type}</td>
                              <td>{col.comment}</td>
                              <td>
                                <div className='flex gap-1 flex-wrap'>
                                  {col.isPrimaryKey && (
                                    <span className='brutalist-badge brutalist-badge-blue text-xs'>
                                      PK
                                    </span>
                                  )}
                                  {col.isAutoIncrement && (
                                    <span className='brutalist-badge brutalist-badge-green text-xs'>
                                      AI
                                    </span>
                                  )}
                                  {col.isUnique && (
                                    <span className='brutalist-badge brutalist-badge-queued text-xs'>
                                      UNIQUE
                                    </span>
                                  )}
                                  {!col.isNullable && (
                                    <span className='brutalist-badge brutalist-badge-pink text-xs'>
                                      NOT NULL
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedTable.indexes && selectedTable.indexes.length > 0 && (
                    <div>
                      <h3 className='brutalist-heading mb-3'>索引</h3>
                      <div className='space-y-2'>
                        {selectedTable.indexes.map((idx: any, i: number) => (
                          <div key={i} className='brutalist-card-sm p-4'>
                            <div className='flex items-center gap-2'>
                              <span className='font-mono font-semibold'>{idx.name}</span>
                              {idx.isUnique && (
                                <span className='brutalist-badge brutalist-badge-blue text-xs'>
                                  UNIQUE
                                </span>
                              )}
                            </div>
                            <p className='text-sm brutalist-text-secondary mt-1'>
                              列: {idx.columns.join(', ')}
                            </p>
                            {idx.comment && (
                              <p className='text-sm brutalist-text-secondary'>{idx.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className='flex justify-end gap-3 pt-4 border-t'>
                    <button
                      className='brutalist-button'
                      onClick={() => {
                        setGeneratedTables([])
                        setSelectedTableIndex(null)
                        setAiDescription('')
                      }}
                    >
                      重新生成
                    </button>
                    <button
                      className='brutalist-button brutalist-button-blue'
                      onClick={handleSaveGeneratedTable}
                      disabled={createTableMutation.isPending || selectedTableIndex === null}
                    >
                      {createTableMutation.isPending ? (
                        <span className='flex items-center gap-3'>
                          <span className='brutalist-loader sm'>
                            <span className='brutalist-loader-dot' />
                            <span className='brutalist-loader-dot' />
                            <span className='brutalist-loader-dot' />
                          </span>
                          <span>保存中...</span>
                        </span>
                      ) : (
                        '💾 保存到项目'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
