export const ROUTES = {
  HOME: '/',
  
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
  },

  // Protected routes
  DASHBOARD: '/dashboard',
  SEARCH: '/search',
  CONTENT: (id: string) => `/content/${id}`,
  
  WATCHLIST: {
    INDEX: '/watchlist',
    SHARED: '/watchlist/shared',
    DETAIL: (id: string) => `/watchlist/${id}`,
  },

  HISTORY: {
    INDEX: '/history',
    STATS: '/history/stats',
  },

  INSIGHTS: '/insights',
  RECOMMENDATIONS: '/recommendations',
  PROFILE: '/profile',
} as const

