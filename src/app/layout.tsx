import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '健康記錄助手',
  description: '專為長輩設計的簡單健康記錄',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '健康記錄',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-Hant">
      <body className={`${inter.className} bg-gray-50 text-gray-900 pb-20`}>
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  )
}
