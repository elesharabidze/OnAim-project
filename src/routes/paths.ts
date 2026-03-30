export const PATHS = {
  root: '/',

  leaderboard: {
    root: '/leaderboards',
    create: '/leaderboards/create',
    detail: (id: string) => `/leaderboards/${id}`,
    edit: (id: string) => `/leaderboards/${id}/edit`,
  },

  raffle: {
    root: '/raffles',
    create: '/raffles/create',
    detail: (id: string) => `/raffles/${id}`,
    edit: (id: string) => `/raffles/${id}/edit`,
  },

  wheel: {
    root: '/wheels',
    create: '/wheels/create',
    detail: (id: string) => `/wheels/${id}`,
    edit: (id: string) => `/wheels/${id}/edit`,
  },

  notFound: '*',
} as const
