import { Suspense } from 'react'
import { SearchContent } from '@/components/features/search/SearchContent'

export const metadata = {
  title: 'Search - Watch Buddy',
  description: 'Search for movies and TV series',
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-700">
              Watch-Buddy
            </span>
          </a>
          <nav className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-blue-700 transition"
            >
              Dashboard
            </a>
            <a
              href="/profile"
              className="text-sm text-gray-600 hover:text-blue-700 transition"
            >
              Profile
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Search Movies & TV Series
        </h1>

        <Suspense fallback={<SearchLoadingSkeleton />}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  )
}

function SearchLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      
      {/* Filters skeleton */}
      <div className="flex gap-4">
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[2/3] bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

