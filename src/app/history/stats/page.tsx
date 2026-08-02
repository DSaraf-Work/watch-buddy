import { AppHeader } from '@/components/layout/AppHeader'
import { HistoryStatsContent } from '@/components/features/history/HistoryStatsContent'

export const metadata = {
  title: 'Watch History Stats - Watch Buddy',
}

export default function HistoryStatsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Watch Statistics</h1>
        <HistoryStatsContent />
      </div>
    </div>
  )
}
