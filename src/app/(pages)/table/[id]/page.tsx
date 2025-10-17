'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'

export default function TableDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tableId = Number(params.id)

  const selectedDbType = 'postgresql' as const

  const { data: table, isLoading } = trpc.schemart.getTable.useQuery(
    { id: tableId },
    { enabled: !isNaN(tableId) },
  )

  const generateSQLMutation = trpc.schemartTools.generateSQLDiff.useMutation()

  const handleCopySQL = async () => {
    try {
      const result = await generateSQLMutation.mutateAsync({
        tableId,
        targetDatabaseType: selectedDbType,
      })
      await navigator.clipboard.writeText(result.sql)
      alert('SQL copied to clipboard!')
    } catch (error: any) {
      alert(`Copy failed: ${error.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className='brutalist-container'>
        <div className='brutalist-card p-8'>
          <p className='brutalist-text'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!table) {
    return (
      <div className='brutalist-container'>
        <div className='brutalist-card p-8'>
          <h1 className='brutalist-title text-red-500'>Table not found</h1>
          <button className='brutalist-button mt-4' onClick={() => router.back()}>
            Back
          </button>
        </div>
      </div>
    )
  }

  const basicFields = table.columns.filter((col) => col.isBasicField)
  const businessFields = table.columns.filter((col) => !col.isBasicField)

  return (
    <div className='brutalist-container'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <button
            className='brutalist-text brutalist-text-secondary hover:text-black mb-2'
            onClick={() => router.back()}
          >
            ← 返回
          </button>
          <h1 className='brutalist-title'>{table.name}</h1>
          {table.comment && (
            <p className='brutalist-text brutalist-text-secondary'>{table.comment}</p>
          )}
        </div>
        <Link href={`/table/${tableId}/edit`}>
          <button className='brutalist-button brutalist-button-blue'>✏️ 编辑表结构</button>
        </Link>
      </div>

      <div className='brutalist-card p-6 mb-6'>
        <h2 className='brutalist-heading mb-4'>Generate CREATE SQL</h2>
        <div className='flex items-center gap-4'>
          <div className='brutalist-badge brutalist-badge-blue'>
            PostgreSQL
          </div>
          <button
            className='brutalist-button brutalist-button-green'
            onClick={handleCopySQL}
            disabled={generateSQLMutation.isLoading}
          >
            {generateSQLMutation.isLoading ? 'Generating...' : 'Copy SQL'}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{table.columns.length}</div>
          <div className='brutalist-stat-label'>Total Columns</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{businessFields.length}</div>
          <div className='brutalist-stat-label'>Business Fields</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{basicFields.length}</div>
          <div className='brutalist-stat-label'>Basic Fields</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{table.indexes?.length || 0}</div>
          <div className='brutalist-stat-label'>Indexes</div>
        </div>
      </div>

      {businessFields.length > 0 && (
        <div className='brutalist-card p-6 mb-6'>
          <h2 className='brutalist-heading mb-4'>Business Fields</h2>
          <div className='overflow-x-auto'>
            <table className='brutalist-table'>
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Comment</th>
                  <th>Constraints</th>
                  <th>Default</th>
                </tr>
              </thead>
              <tbody>
                {businessFields.map((col) => (
                  <tr key={col.id}>
                    <td className='font-mono font-semibold'>{col.name}</td>
                    <td className='font-mono'>{col.type}</td>
                    <td>{col.comment}</td>
                    <td>
                      <div className='flex gap-1 flex-wrap'>
                        {col.isPrimaryKey && (
                          <span className='brutalist-badge brutalist-badge-blue text-xs'>PK</span>
                        )}
                        {col.isAutoIncrement && (
                          <span className='brutalist-badge brutalist-badge-green text-xs'>
                            AUTO_INCREMENT
                          </span>
                        )}
                        {col.isUnique && (
                          <span className='brutalist-badge brutalist-badge-yellow text-xs'>
                            UNIQUE
                          </span>
                        )}
                        {!col.isNullable && (
                          <span className='brutalist-badge brutalist-badge-queued text-xs'>
                            NOT NULL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='font-mono text-xs'>{col.defaultValue || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {basicFields.length > 0 && (
        <div className='brutalist-card p-6 mb-6' style={{ backgroundColor: '#f9f9f9' }}>
          <h2 className='brutalist-heading mb-4'>Basic Fields</h2>
          <div className='overflow-x-auto'>
            <table className='brutalist-table'>
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Comment</th>
                  <th>Constraints</th>
                  <th>Default</th>
                </tr>
              </thead>
              <tbody>
                {basicFields.map((col) => (
                  <tr key={col.id} style={{ backgroundColor: '#f0f0f0' }}>
                    <td className='font-mono font-semibold'>{col.name}</td>
                    <td className='font-mono'>{col.type}</td>
                    <td>{col.comment}</td>
                    <td>
                      <div className='flex gap-1 flex-wrap'>
                        {col.isPrimaryKey && (
                          <span className='brutalist-badge brutalist-badge-blue text-xs'>PK</span>
                        )}
                        {col.isAutoIncrement && (
                          <span className='brutalist-badge brutalist-badge-green text-xs'>
                            AUTO_INCREMENT
                          </span>
                        )}
                        {col.isUnique && (
                          <span className='brutalist-badge brutalist-badge-yellow text-xs'>
                            UNIQUE
                          </span>
                        )}
                        {!col.isNullable && (
                          <span className='brutalist-badge brutalist-badge-queued text-xs'>
                            NOT NULL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='font-mono text-xs'>{col.defaultValue || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {table.indexes && table.indexes.length > 0 && (
        <div className='brutalist-card p-6'>
          <h2 className='brutalist-heading mb-4'>Indexes</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {table.indexes.map((idx) => (
              <div key={idx.id} className='brutalist-card-sm p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <h3 className='font-mono font-semibold'>{idx.name}</h3>
                  {idx.isUnique && (
                    <span className='brutalist-badge brutalist-badge-blue text-xs'>UNIQUE</span>
                  )}
                </div>
                <p className='brutalist-text text-xs mb-1'>
                  <span className='font-semibold'>Columns:</span>{' '}
                  <span className='font-mono'>{idx.columns.join(', ')}</span>
                </p>
                {idx.comment && (
                  <p className='brutalist-text brutalist-text-secondary text-xs'>
                    {idx.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
