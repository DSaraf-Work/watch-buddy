import { Suspense } from 'react'
import { ContentDetail } from '@/components/features/content/ContentDetail'
import { notFound } from 'next/navigation'
import type { RouteParams } from '@/lib/utils/route-params'

export async function generateMetadata({ params }: RouteParams<{ id: string }>) {
  const { id } = await params
  const [, type] = id.split('-')

  return {
    title: `Content Details - Watch Buddy`,
    description: `View details for ${type === 'movie' ? 'movie' : 'TV series'}`,
  }
}

export default async function ContentDetailPage({ params }: RouteParams<{ id: string }>) {
  const { id } = await params
  const [tmdbId, contentType] = id.split('-')

  if (!tmdbId || !contentType || !['movie', 'series'].includes(contentType)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<ContentDetailSkeleton />}>
        <ContentDetail contentId={id} />
      </Suspense>
    </div>
  )
}

function ContentDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative h-96 bg-gray-300" />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] bg-gray-300 rounded-lg" />
          </div>

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
