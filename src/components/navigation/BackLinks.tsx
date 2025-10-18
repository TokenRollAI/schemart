'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/utils'

type BackLinksProps = {
  className?: string
  previousHref?: string
  previousLabel?: string
}

export function BackLinks({
  className,
  previousHref,
  previousLabel = '返回上一级',
}: BackLinksProps) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    if (previousHref) {
      router.push(previousHref)
      return
    }

    router.push('/')
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Link href='/' className='brutalist-back-link'>
        <span>←</span>
        <span>返回首页</span>
      </Link>
      <button
        type='button'
        onClick={handleBack}
        className='brutalist-back-link'
      >
        <span>←</span>
        <span>{previousLabel}</span>
      </button>
    </div>
  )
}
