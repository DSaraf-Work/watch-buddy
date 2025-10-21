import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Authentication - Watch-Buddy',
  description: 'Sign in or create an account to start tracking your watch history',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <header className="border-b border-primary-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-700">
              Watch-Buddy
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-primary-700 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary-200 bg-white/80 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 Watch-Buddy. Your Personal OTT Companion.</p>
        </div>
      </footer>
    </div>
  )
}

