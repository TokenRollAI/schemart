import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='brutalist-container'>
      <div className='brutalist-card p-12 text-center'>
        <h1 className='brutalist-title'>404</h1>
        <p className='brutalist-text brutalist-text-secondary mb-8'>
          Page not found
        </p>
        <Link href='/'>
          <button className='brutalist-button'>Back to Home</button>
        </Link>
      </div>
    </div>
  )
}
