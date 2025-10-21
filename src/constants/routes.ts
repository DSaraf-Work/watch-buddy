export const ROUTES = {
  HOME: '/',
  
  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CALLBACK: '/auth/callback',
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

