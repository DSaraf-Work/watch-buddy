import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth/AuthProvider'

export const metadata: Metadata = {
  title: 'Watch-Buddy - Your Personal OTT Companion',
  description:
    'Centralize your watch history and watchlists across all OTT platforms',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

