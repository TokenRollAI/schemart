'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'

export default function EditTablePage() {
  const params = useParams()
  const router = useRouter()
  const tableId = Number(params.id)

  // 状态管理
  const [tableName, setTableName] = useState('')
  const [tableComment, setTableComment] = useState('')
  const [columns, setColumns] = useState<any[]>([])
  const [indexes, setIndexes] = useState<any[]>([])

  // tRPC hooks
  const { data: table, isLoading } = trpc.schemart.getTable.useQuery(
    { id: tableId },
    { enabled: !isNaN(tableId) },
  )

  const updateTableMutation = trpc.schemart.updateTable.useMutation({
    onSuccess: () => {
      alert('表更新成功!')
      router.push(`/table/${tableId}`)
    },
    onError: (error) => {
      console.error('更新表失败:', error)
      alert(`更新表失败: ${error.message}`)
    },
  })

  // 初始化表单数据
  useEffect(() => {
    if (table) {
      setTableName(table.name)
      setTableComment(table.comment || '')
      setColumns(table.columns || [])
      setIndexes(table.indexes || [])
    }
  }, [table])

  // 处理保存
  const handleSave = () => {
    if (!tableName.trim()) {
      alert('请输入表名')
      return
    }

    updateTableMutation.mutate({
      id: tableId,
      name: tableName.trim(),
      comment: tableComment.trim() || undefined,
      columns,
      indexes,
    })
  }

  // 添加列
  const handleAddColumn = () => {
    setColumns([
      ...columns,
      {
        name: '',
        type: 'TEXT',
        comment: '',
        isNullable: true,
        isPrimaryKey: false,
        isAutoIncrement: false,
        isUnique: false,
        isBasicField: false,
        orderIndex: columns.length,
      },
    ])
  }

  // 删除列
  const handleRemoveColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index)
    setColumns(newColumns.map((col, i) => ({ ...col, orderIndex: i })))
  }

  // 更新列
  const handleUpdateColumn = (index: number, field: string, value: any) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
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

  if (!table) {
    return (
      <div className='brutalist-container'>
        <div className='brutalist-card p-8'>
          <h1 className='brutalist-title text-red-500'>表不存在</h1>
          <button className='brutalist-button mt-4' onClick={() => router.back()}>
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='brutalist-container'>
      {/* 头部 */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <Link
            href={`/table/${tableId}`}
            className='brutalist-text brutalist-text-secondary hover:text-black'
          >
            ← 返回表详情
          </Link>
          <h1 className='brutalist-title mt-2'>✏️ 编辑表结构</h1>
        </div>
        <div className='flex gap-3'>
          <Link href={`/table/${tableId}`}>
            <button className='brutalist-button'>取消</button>
          </Link>
          <button
            className='brutalist-button brutalist-button-blue'
            onClick={handleSave}
            disabled={updateTableMutation.isLoading}
          >
            {updateTableMutation.isLoading ? '保存中...' : '💾 保存修改'}
          </button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className='brutalist-card p-8 mb-6'>
        <h2 className='brutalist-heading mb-4'>基本信息</h2>
        <div className='space-y-4'>
          <div>
            <label className='brutalist-text block mb-2 font-semibold'>表名 *</label>
            <input
              type='text'
              className='brutalist-input w-full'
              placeholder='例如：users'
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>
          <div>
            <label className='brutalist-text block mb-2 font-semibold'>表注释</label>
            <textarea
              className='brutalist-input w-full resize-none'
              placeholder='例如：用户表'
              value={tableComment}
              onChange={(e) => setTableComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* 列定义 */}
      <div className='brutalist-card p-8 mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='brutalist-heading'>列定义</h2>
          <button className='brutalist-button brutalist-button-green text-sm' onClick={handleAddColumn}>
            ➕ 添加列
          </button>
        </div>

        <div className='space-y-3'>
          {columns.map((col, index) => (
            <div key={index} className='brutalist-card-sm p-4'>
              <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
                <div className='md:col-span-3'>
                  <label className='brutalist-text text-xs block mb-1'>列名 *</label>
                  <input
                    type='text'
                    className='brutalist-input w-full'
                    value={col.name}
                    onChange={(e) => handleUpdateColumn(index, 'name', e.target.value)}
                    placeholder='column_name'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='brutalist-text text-xs block mb-1'>类型 *</label>
                  <select
                    className='brutalist-input w-full'
                    value={col.type}
                    onChange={(e) => handleUpdateColumn(index, 'type', e.target.value)}
                  >
                    <option value='TEXT'>TEXT</option>
                    <option value='INTEGER'>INTEGER</option>
                    <option value='BIGINT'>BIGINT</option>
                    <option value='SERIAL'>SERIAL</option>
                    <option value='BIGSERIAL'>BIGSERIAL</option>
                    <option value='BOOLEAN'>BOOLEAN</option>
                    <option value='TIMESTAMPTZ'>TIMESTAMPTZ</option>
                    <option value='JSONB'>JSONB</option>
                    <option value='UUID'>UUID</option>
                    <option value='DECIMAL'>DECIMAL</option>
                  </select>
                </div>
                <div className='md:col-span-4'>
                  <label className='brutalist-text text-xs block mb-1'>注释 *</label>
                  <input
                    type='text'
                    className='brutalist-input w-full'
                    value={col.comment}
                    onChange={(e) => handleUpdateColumn(index, 'comment', e.target.value)}
                    placeholder='列的描述'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='brutalist-text text-xs block mb-1'>约束</label>
                  <div className='flex gap-2'>
                    <label className='flex items-center gap-1 text-xs'>
                      <input
                        type='checkbox'
                        checked={col.isPrimaryKey}
                        onChange={(e) => handleUpdateColumn(index, 'isPrimaryKey', e.target.checked)}
                      />
                      PK
                    </label>
                    <label className='flex items-center gap-1 text-xs'>
                      <input
                        type='checkbox'
                        checked={!col.isNullable}
                        onChange={(e) => handleUpdateColumn(index, 'isNullable', !e.target.checked)}
                      />
                      NOT NULL
                    </label>
                  </div>
                </div>
                <div className='md:col-span-1 flex items-end'>
                  <button
                    className='brutalist-button brutalist-button-pink w-full text-sm'
                    onClick={() => handleRemoveColumn(index)}
                    disabled={col.isBasicField}
                    title={col.isBasicField ? '基本字段不能删除' : '删除此列'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {columns.length === 0 && (
          <p className='brutalist-text brutalist-text-secondary text-center py-8'>
            还没有添加任何列，点击"添加列"按钮开始
          </p>
        )}
      </div>
    </div>
  )
}
