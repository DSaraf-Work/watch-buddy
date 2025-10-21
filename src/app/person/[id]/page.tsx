import { Suspense } from 'react'
import { PersonDetail } from '@/components/features/person/PersonDetail'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Person Details - Watch Buddy`,
    description: `View filmography and details`,
  }
}

export default function PersonPage({ params }: PageProps) {
  const personId = parseInt(params.id)

  if (isNaN(personId)) {
    return <div>Invalid person ID</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PersonDetailSkeleton />}>
        <PersonDetail personId={personId} />
      </Suspense>
    </div>
  )
}

function PersonDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative h-64 bg-gray-300" />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] bg-gray-300 rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-32 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

