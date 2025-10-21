'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

interface CastSectionProps {
  cast: CastMember[]
}

export function CastSection({ cast }: CastSectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cast.map((member) => {
        const profileUrl = member.profile_path
          ? `https://image.tmdb.org/t/p/w200${member.profile_path}`
          : '/placeholder-avatar.png'

        return (
          <Link
            key={member.id}
            href={`/person/${member.id}`}
            className="text-center group cursor-pointer"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 mb-2 group-hover:ring-2 group-hover:ring-blue-500 transition-all">
              <Image
                src={profileUrl}
                alt={member.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
            </div>
            <p className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {member.name}
            </p>
            <p className="text-xs text-gray-600 line-clamp-1">{member.character}</p>
          </Link>
        )
      })}
    </div>
  )
}

