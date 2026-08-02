import { AppHeader } from '@/components/layout/AppHeader'
import { SharedWatchlistsContent } from '@/components/features/watchlist/SharedWatchlistsContent'
import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

export const metadata = {
  title: 'Shared Watchlists - Watch Buddy',
}

export default function SharedWatchlistsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shared Watchlists</h1>
            <p className="mt-2 text-gray-600">Collaborate and discover what friends want to watch.</p>
          </div>
          <Link href={ROUTES.WATCHLIST.INDEX} className="text-sm text-blue-700 hover:underline">
            All watchlists
          </Link>
        </div>
        <SharedWatchlistsContent />
      </div>
    </div>
  )
}
