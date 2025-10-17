import type { Metadata } from 'next'
import Link from 'next/link'
import { OpenAIChatDemo } from '@/components/chat/OpenAIChatDemo'

export const metadata: Metadata = {
  title: 'OpenAI Demo | Fast MVP',
  description:
    'OpenAI integration demo using Vercel AI SDK. Shows how to quickly add AI capabilities to your Fast MVP project.',
}

export default function OpenAIPage() {
  return (
    <div className='brutalist-container'>
      <div className='mb-8'>
        <Link href='/'>
          <button className='brutalist-button brutalist-button-blue mb-4'>
            ← Back to Home
          </button>
        </Link>
        <h1 className='brutalist-title'>AI Chat Demo</h1>
        <p className='brutalist-text brutalist-text-secondary max-w-3xl mb-6'>
          Experience OpenAI chat capabilities in Fast MVP. This demo uses Vercel
          AI SDK to call the OpenAI model configured in your environment
          variables.
        </p>

        {/* Info Card */}
        <div className='brutalist-card-sm p-6 bg-blue-50'>
          <h3 className='brutalist-text font-semibold mb-2'>Quick Start</h3>
          <p className='brutalist-text brutalist-text-secondary text-sm'>
            Set{' '}
            <code className='bg-white px-2 py-1 rounded'>OPENAI_API_KEY</code>{' '}
            (and optionally{' '}
            <code className='bg-white px-2 py-1 rounded'>OPENAI_MODEL</code>) in{' '}
            <code className='bg-white px-2 py-1 rounded'>.env.local</code>, then
            restart the dev server.
          </p>
        </div>
      </div>

      <OpenAIChatDemo />
    </div>
  )
}
