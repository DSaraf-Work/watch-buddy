'use client'

interface Platform {
  id: string
  platform: {
    id: string
    name: string
    logo_url: string | null
    website_url: string | null
  }
  content_url: string | null
}

interface PlatformBadgesProps {
  platforms: Platform[]
}

export function PlatformBadges({ platforms }: PlatformBadgesProps) {
  return (
    <div className="space-y-2">
      {platforms.map((item) => {
        const url = item.content_url || item.platform.website_url

        const badge = (
          <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
            {item.platform.logo_url ? (
              <img
                src={item.platform.logo_url}
                alt={item.platform.name}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                {item.platform.name.charAt(0)}
              </div>
            )}
            <span className="font-medium text-gray-900">{item.platform.name}</span>
          </div>
        )

        if (url) {
          return (
            <a
              key={item.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {badge}
            </a>
          )
        }

        return <div key={item.id}>{badge}</div>
      })}
    </div>
  )
}

