import type { Metadata } from 'next'
import './globals.css'
import '@radix-ui/themes/styles.css'
import { Theme } from '@radix-ui/themes'
import { TRPCProvider } from '@/components/providers/TrpcProvider'
import { IBM_Plex_Sans } from 'next/font/google'

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex',
})

export const metadata: Metadata = {
  title: {
    default: 'Fast MVP - AI 应用快速开发模板',
    template: '%s | Fast MVP',
  },
  description:
    '基于 Next.js 15、tRPC 和多 AI Provider 的全栈应用模板，支持 OpenAI、Claude 和 Gemini',
  keywords: ['Next.js', 'tRPC', 'AI', 'OpenAI', 'Claude', 'Gemini', 'MVP'],
  authors: [{ name: 'Fast MVP Team' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'Fast MVP',
    title: 'Fast MVP - AI 应用快速开发模板',
    description: '快速构建 AI 驱动的全栈应用',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className={ibmPlexSans.variable}>
      <body className='font-sans antialiased'>
        <Theme
          accentColor='orange'
          grayColor='sand'
          radius='large'
          appearance='light'
        >
          <TRPCProvider>{children}</TRPCProvider>
        </Theme>
      </body>
    </html>
  )
}
