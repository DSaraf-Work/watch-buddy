import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

const NAV_LINKS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard' },
  { href: ROUTES.SEARCH, label: 'Search' },
  { href: ROUTES.WATCHLIST.INDEX, label: 'Watchlist' },
  { href: ROUTES.HISTORY.INDEX, label: 'History' },
  { href: ROUTES.INSIGHTS, label: 'Insights' },
  { href: ROUTES.PROFILE, label: 'Profile' },
]

export function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={ROUTES.DASHBOARD} className="text-2xl font-bold text-blue-700">
          Watch-Buddy
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-blue-700 transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
