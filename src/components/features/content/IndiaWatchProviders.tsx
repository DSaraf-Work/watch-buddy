'use client'

import Image from 'next/image'

interface WatchProvider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}

interface IndiaWatchProvidersProps {
  providers: {
    streamingPlatforms: WatchProvider[]
    rentPlatforms: WatchProvider[]
    buyPlatforms: WatchProvider[]
    link?: string
  } | null
}

export function IndiaWatchProviders({ providers }: IndiaWatchProvidersProps) {
  if (!providers) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🇮🇳 Available in India
        </h3>
        <p className="text-gray-600 text-sm">
          No streaming information available for India at this time.
        </p>
      </div>
    )
  }

  const hasAnyProviders =
    providers.streamingPlatforms.length > 0 ||
    providers.rentPlatforms.length > 0 ||
    providers.buyPlatforms.length > 0

  if (!hasAnyProviders) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🇮🇳 Available in India
        </h3>
        <p className="text-gray-600 text-sm">
          Not currently available on streaming platforms in India.
        </p>
      </div>
    )
  }

  const getProviderLogoUrl = (logoPath: string) => {
    return `https://image.tmdb.org/t/p/original${logoPath}`
  }

  const getProviderWebsiteUrl = (providerName: string): string | null => {
    const urls: Record<string, string> = {
      'Netflix': 'https://www.netflix.com/in/',
      'Amazon Prime Video': 'https://www.primevideo.com/',
      'Amazon Prime Video with Ads': 'https://www.primevideo.com/',
      'Amazon Video': 'https://www.primevideo.com/',
      'Disney Plus': 'https://www.hotstar.com/',
      'Disney+ Hotstar': 'https://www.hotstar.com/',
      'JioHotstar': 'https://www.hotstar.com/',
      'Hotstar': 'https://www.hotstar.com/',
      'Apple TV': 'https://tv.apple.com/in',
      'Apple TV Plus': 'https://tv.apple.com/in',
      'Google Play Movies': 'https://play.google.com/store/movies',
      'YouTube': 'https://www.youtube.com/',
      'Sony Liv': 'https://www.sonyliv.com/',
      'SonyLIV': 'https://www.sonyliv.com/',
      'Zee5': 'https://www.zee5.com/',
      'ZEE5': 'https://www.zee5.com/',
      'Voot': 'https://www.voot.com/',
      'HBO Max': 'https://www.hbomax.com/',
      'Hulu': 'https://www.hulu.com/',
      'Paramount Plus': 'https://www.paramountplus.com/',
      'Paramount+': 'https://www.paramountplus.com/',
    }
    return urls[providerName] || null
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🇮🇳 Available in India
        </h3>
        {providers.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View on JustWatch →
          </a>
        )}
      </div>

      <div className="space-y-4">
        {/* Streaming Platforms */}
        {providers.streamingPlatforms.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Stream</p>
            <div className="flex flex-wrap gap-3">
              {providers.streamingPlatforms.map((provider) => {
                const providerUrl = getProviderWebsiteUrl(provider.provider_name)
                const content = (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <Image
                      src={getProviderLogoUrl(provider.logo_path)}
                      alt={provider.provider_name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                )

                return (
                  <div
                    key={provider.provider_id}
                    className="group relative"
                    title={provider.provider_name}
                  >
                    {providerUrl ? (
                      <a
                        href={providerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {provider.provider_name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Rent Platforms */}
        {providers.rentPlatforms.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Rent</p>
            <div className="flex flex-wrap gap-3">
              {providers.rentPlatforms.map((provider) => {
                const providerUrl = getProviderWebsiteUrl(provider.provider_name)
                const content = (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <Image
                      src={getProviderLogoUrl(provider.logo_path)}
                      alt={provider.provider_name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                )

                return (
                  <div
                    key={provider.provider_id}
                    className="group relative"
                    title={provider.provider_name}
                  >
                    {providerUrl ? (
                      <a
                        href={providerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {provider.provider_name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Buy Platforms */}
        {providers.buyPlatforms.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Buy</p>
            <div className="flex flex-wrap gap-3">
              {providers.buyPlatforms.map((provider) => {
                const providerUrl = getProviderWebsiteUrl(provider.provider_name)
                const content = (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <Image
                      src={getProviderLogoUrl(provider.logo_path)}
                      alt={provider.provider_name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                )

                return (
                  <div
                    key={provider.provider_id}
                    className="group relative"
                    title={provider.provider_name}
                  >
                    {providerUrl ? (
                      <a
                        href={providerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {provider.provider_name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Powered by JustWatch • Data may vary by region
      </p>
    </div>
  )
}

