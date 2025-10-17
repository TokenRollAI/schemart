'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

export default function HelloDemo() {
  const [name, setName] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const utils = trpc.useUtils()

  // tRPC mutations
  const sayHelloMutation = trpc.hello.sayHello.useMutation({
    onSuccess: () => {
      utils.hello.getAll.invalidate()
      setName('')
      if (selectedName === name.trim()) {
        setSelectedName('')
      }
    },
  })

  // tRPC queries
  const getCountQuery = trpc.hello.getCount.useQuery(
    { name: selectedName },
    {
      enabled: !!selectedName,
    },
  )

  const getAllQuery = trpc.hello.getAll.useQuery()

  // Filter records
  const filteredRecords =
    getAllQuery.data?.filter((record) =>
      record.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  // Statistics
  const totalRecords = getAllQuery.data?.length || 0
  const totalGreetings =
    getAllQuery.data?.reduce((sum, record) => sum + record.count, 0) || 0
  const averageGreetings =
    totalRecords > 0 ? (totalGreetings / totalRecords).toFixed(1) : '0'

  return (
    <div className='space-y-6'>
      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{totalRecords}</div>
          <div className='brutalist-stat-label'>Total Users</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{totalGreetings}</div>
          <div className='brutalist-stat-label'>Total Greetings</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>{averageGreetings}</div>
          <div className='brutalist-stat-label'>Average per User</div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className='brutalist-card p-8'>
        <h2 className='brutalist-heading'>Greeting System</h2>
        <p className='brutalist-text brutalist-text-secondary mb-6'>
          Enter a name to greet or query greeting count
        </p>

        <div className='space-y-4'>
          {/* Name Input */}
          <div>
            <label className='brutalist-text block mb-2 font-semibold'>
              Name
            </label>
            <input
              type='text'
              className='brutalist-input'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter a name...'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  sayHelloMutation.mutate({ name: name.trim() })
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3'>
            <button
              onClick={() =>
                name.trim() && sayHelloMutation.mutate({ name: name.trim() })
              }
              disabled={sayHelloMutation.isPending || !name.trim()}
              className='brutalist-button flex-1'
            >
              {sayHelloMutation.isPending ? 'Processing...' : '👋 Say Hello'}
            </button>

            <button
              onClick={() => name.trim() && setSelectedName(name.trim())}
              disabled={!name.trim()}
              className='brutalist-button brutalist-button-blue flex-1'
            >
              🔍 Query Count
            </button>
          </div>

          {/* Success Message */}
          {sayHelloMutation.data && (
            <div className='brutalist-card-sm p-4 bg-green-50'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='brutalist-badge brutalist-badge-green'>
                  Success
                </span>
                <span className='brutalist-text font-semibold'>
                  {sayHelloMutation.data.message}
                </span>
              </div>
              <p className='brutalist-text brutalist-text-secondary text-sm'>
                Current count: {sayHelloMutation.data.count}
              </p>
            </div>
          )}

          {/* Query Result */}
          {getCountQuery.data && selectedName && (
            <div className='brutalist-card-sm p-4 bg-blue-50'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='brutalist-badge brutalist-badge-blue'>
                  Query Result
                </span>
                <span className='brutalist-text font-semibold'>
                  {getCountQuery.data.message}
                </span>
              </div>
              <p className='brutalist-text brutalist-text-secondary text-sm'>
                Greeting count: {getCountQuery.data.count}
              </p>
            </div>
          )}

          {/* Error Message */}
          {(sayHelloMutation.error || getCountQuery.error) && (
            <div className='brutalist-card-sm p-4 bg-red-50'>
              <div className='flex items-center gap-2'>
                <span className='brutalist-badge brutalist-badge-pink'>
                  Error
                </span>
                <span className='brutalist-text font-semibold'>
                  {sayHelloMutation.error?.message ||
                    getCountQuery.error?.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Records List */}
      <div className='brutalist-card p-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='brutalist-heading'>Greeting Records</h2>
            <p className='brutalist-text brutalist-text-secondary'>
              All user greeting history
            </p>
          </div>
          <span className='brutalist-badge brutalist-badge-queued'>
            {filteredRecords.length} records
          </span>
        </div>

        {/* Search Input */}
        <div className='mb-6'>
          <label className='brutalist-text block mb-2 font-semibold'>
            Search Users
          </label>
          <input
            type='text'
            className='brutalist-input'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search by name...'
          />
        </div>

        {/* Records Table */}
        {getAllQuery.isLoading ? (
          <div className='text-center py-8'>
            <p className='brutalist-text brutalist-text-secondary'>
              Loading...
            </p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <table className='brutalist-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Greeting Count</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td className='font-semibold'>#{record.id}</td>
                  <td className='font-medium'>{record.name}</td>
                  <td>
                    <span
                      className={`brutalist-badge ${
                        record.count > 5
                          ? 'brutalist-badge-yellow'
                          : 'brutalist-badge-blue'
                      }`}
                    >
                      {record.count} times
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedName(record.name)}
                      className='brutalist-button brutalist-button-green text-sm py-2 px-4'
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='text-center py-8'>
            <p className='brutalist-text brutalist-text-secondary mb-2'>
              {searchQuery ? 'No matching records found' : 'No records yet'}
            </p>
            {!searchQuery && (
              <p className='brutalist-text brutalist-text-secondary text-sm'>
                Enter a name and click &quot;Say Hello&quot; to get started
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
