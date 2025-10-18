import HelloDemo from '@/components/helloDemo/HelloDemo'
import Link from 'next/link'

export default function TrpcPage() {
  return (
    <div className='brutalist-container'>
      <div className='mb-8'>
        <Link href='/' className='brutalist-back-link mb-4'>
          <span>←</span>
          <span>返回首页</span>
        </Link>
        <h1 className='brutalist-title'>tRPC Demo</h1>
        <p className='brutalist-text brutalist-text-secondary max-w-3xl'>
          Full-stack type-safe API demonstration with tRPC, Zod validation, and
          Drizzle ORM. This shows how to build modern applications with
          end-to-end type safety.
        </p>
      </div>
      <HelloDemo />
    </div>
  )
}
