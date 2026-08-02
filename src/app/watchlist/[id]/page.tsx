import { AppHeader } from '@/components/layout/AppHeader'
import { WatchlistDetailContent } from '@/components/features/watchlist/WatchlistDetailContent'

export const metadata = {
  title: 'Watchlist Detail - Watch Buddy',
}

export default async function WatchlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <WatchlistDetailContent watchlistId={id} />
      </div>
    </div>
  )
}
