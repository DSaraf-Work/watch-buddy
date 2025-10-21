import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white p-8">
      <main className="flex max-w-4xl flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold text-primary-900">
          Watch-Buddy
        </h1>
        <p className="text-xl text-gray-600">
          Your Personal OTT Companion
        </p>
        <p className="max-w-2xl text-lg text-gray-500">
          Centralize your watch history and watchlists across all major OTT
          platforms. Search for movies and series, track what you&apos;ve watched,
          and discover what to watch next.
        </p>

        <div className="flex gap-4">
          <Link
            href="/auth/signup"
            className="rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border-2 border-primary-600 px-6 py-3 font-semibold text-primary-600 transition hover:bg-primary-50"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard
            title="Search & Discover"
            description="Find movies and series with detailed metadata, cast info, and OTT availability"
          />
          <FeatureCard
            title="Track Your Watchlist"
            description="Create personal and shared watchlists with friends and family"
          />
          <FeatureCard
            title="Watch History"
            description="Keep track of everything you've watched across all platforms"
          />
        </div>
      </main>

      <footer className="mt-16 text-sm text-gray-400">
        <p>© 2025 Watch-Buddy. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

