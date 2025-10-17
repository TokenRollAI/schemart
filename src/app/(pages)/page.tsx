'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  return (
    <div className='brutalist-container'>
      {/* Title */}
      <h1 className='brutalist-title'>Fast MVP Workspace</h1>

      {/* Statistics Cards Row */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>3</div>
          <div className='brutalist-stat-label'>Total Projects</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>2</div>
          <div className='brutalist-stat-label'>In Progress</div>
        </div>
        <div className='brutalist-stat-card'>
          <div className='brutalist-stat-value'>1</div>
          <div className='brutalist-stat-label'>Completed</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Panel - Projects Table */}
        <div className='lg:col-span-2 brutalist-card p-8'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='brutalist-heading'>Projects</h2>
            <div className='flex gap-3'>
              <Link href='/trpc'>
                <button className='brutalist-button'>✨ New Project</button>
              </Link>
              <button className='brutalist-button brutalist-button-pink'>
                Delete
              </button>
            </div>
          </div>

          <table className='brutalist-table'>
            <thead>
              <tr>
                <th>Status</th>
                <th>Project Name</th>
                <th>Tech Stack</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className='brutalist-badge brutalist-badge-blue'>
                    In Progress
                  </span>
                </td>
                <td className='font-semibold'>Fast MVP</td>
                <td className='brutalist-text-secondary'>
                  Next.js, tRPC, Radix UI
                </td>
              </tr>
              <tr>
                <td>
                  <span className='brutalist-badge brutalist-badge-green'>
                    Completed
                  </span>
                </td>
                <td className='font-semibold'>AI Chat Demo</td>
                <td className='brutalist-text-secondary'>
                  OpenAI, Vercel AI SDK
                </td>
              </tr>
              <tr>
                <td>
                  <span className='brutalist-badge brutalist-badge-queued'>
                    Queued
                  </span>
                </td>
                <td className='font-semibold'>Database Schema</td>
                <td className='brutalist-text-secondary'>
                  Drizzle ORM, SQLite
                </td>
              </tr>
              <tr>
                <td>
                  <span className='brutalist-badge brutalist-badge-blue'>
                    In Progress
                  </span>
                </td>
                <td className='font-semibold'>API Integration</td>
                <td className='brutalist-text-secondary'>tRPC, Zod</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Settings Panel */}
        <div className='brutalist-card p-6'>
          <h2 className='brutalist-heading'>Settings</h2>

          <div className='space-y-6'>
            {/* Username Input */}
            <div>
              <label className='brutalist-text block mb-2 font-semibold'>
                Username
              </label>
              <input
                type='text'
                className='brutalist-input'
                placeholder='Enter your name'
                defaultValue='Developer'
              />
            </div>

            {/* Notifications Toggle */}
            <div>
              <label className='brutalist-text block mb-2 font-semibold'>
                Notifications
              </label>
              <div
                className={`brutalist-toggle ${notificationsEnabled ? 'active' : ''}`}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <div className='brutalist-toggle-knob'></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='pt-4'>
              <h3 className='brutalist-text font-semibold mb-3'>
                Quick Actions
              </h3>
              <div className='space-y-3'>
                <Link href='/openai' className='block'>
                  <button className='brutalist-button brutalist-button-blue w-full'>
                    AI Chat Demo
                  </button>
                </Link>
                <Link href='/trpc' className='block'>
                  <button className='brutalist-button brutalist-button-green w-full'>
                    tRPC Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='brutalist-card-sm p-6'>
          <h3 className='brutalist-heading text-lg'>⚡ Type-Safe APIs</h3>
          <p className='brutalist-text brutalist-text-secondary'>
            End-to-end type safety with tRPC and Zod validation. Build APIs with
            confidence.
          </p>
        </div>
        <div className='brutalist-card-sm p-6'>
          <h3 className='brutalist-heading text-lg'>🤖 AI Integration</h3>
          <p className='brutalist-text brutalist-text-secondary'>
            Pre-configured support for OpenAI, Claude, and Gemini with Vercel AI
            SDK.
          </p>
        </div>
        <div className='brutalist-card-sm p-6'>
          <h3 className='brutalist-heading text-lg'>🎨 Neo-Brutalism UI</h3>
          <p className='brutalist-text brutalist-text-secondary'>
            Clean, functional design with bold borders and hard shadows. No
            fluff.
          </p>
        </div>
        <div className='brutalist-card-sm p-6'>
          <h3 className='brutalist-heading text-lg'>🗄️ Database Ready</h3>
          <p className='brutalist-text brutalist-text-secondary'>
            Drizzle ORM with SQLite. Migrations, queries, and relations made
            simple.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className='mt-12 text-center'>
        <p className='brutalist-text brutalist-text-secondary'>
          Fast MVP - Build your ideas faster with modern tools
        </p>
      </footer>
    </div>
  )
}
