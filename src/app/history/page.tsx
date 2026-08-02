import { AppHeader } from '@/components/layout/AppHeader'
import { HistoryContent } from '@/components/features/history/HistoryContent'

export const metadata = {
  title: 'Watch History - Watch Buddy',
  description: 'View your watch history across all platforms',
}

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Watch History</h1>
        <p className="text-gray-600 mb-8">Everything you have watched, in one place.</p>
        <HistoryContent />
      </div>
    </div>
  )
}
