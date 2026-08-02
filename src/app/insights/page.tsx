import { AppHeader } from '@/components/layout/AppHeader'
import { InsightsContent } from '@/components/features/insights/InsightsContent'

export const metadata = {
  title: 'Insights - Watch Buddy',
  description: 'View your viewing habits and personalized recommendations',
}

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Insights</h1>
        <p className="text-gray-600 mb-8">
          Discover your viewing patterns and get recommendations based on your history.
        </p>
        <InsightsContent />
      </div>
    </div>
  )
}
