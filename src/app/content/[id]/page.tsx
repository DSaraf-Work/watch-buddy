import { Suspense } from 'react'
import { ContentDetail } from '@/components/features/content/ContentDetail'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  // Parse ID to get title for metadata
  const [tmdbId, type] = params.id.split('-')
  
  return {
    title: `Content Details - Watch Buddy`,
    description: `View details for ${type === 'movie' ? 'movie' : 'TV series'}`,
  }
}

export default function ContentDetailPage({ params }: PageProps) {
  // Validate ID format
  const [tmdbId, contentType] = params.id.split('-')
  
  if (!tmdbId || !contentType || !['movie', 'series'].includes(contentType)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<ContentDetailSkeleton />}>
        <ContentDetail contentId={params.id} />
      </Suspense>
    </div>
  )
}

function ContentDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative h-96 bg-gray-300" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster Skeleton */}
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] bg-gray-300 rounded-lg" />
          </div>
          
          {/* Details Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-20 bg-gray-300 rounded" />
            <div className="h-32 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

