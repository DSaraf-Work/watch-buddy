import { AppHeader } from '@/components/layout/AppHeader'
import { WatchlistContent } from '@/components/features/watchlist/WatchlistContent'

export const metadata = {
  title: 'Watchlist - Watch Buddy',
  description: 'Manage your personal and shared watchlists',
}

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Watchlists</h1>
        <p className="text-gray-600 mb-8">Track what you want to watch across every platform.</p>
        <WatchlistContent />
      </div>
    </div>
  )
}
