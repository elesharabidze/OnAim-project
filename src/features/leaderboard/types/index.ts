export type LeaderboardStatus = 'draft' | 'active' | 'completed'
export type PrizeType = 'coins' | 'freeSpin' | 'bonus'
export type ScoringType = 'points' | 'wins' | 'wagered'

export interface LeaderboardPrize {
  id: string
  rank: number
  name: string
  type: PrizeType
  amount: number
  imageUrl: string
}

export interface Leaderboard {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: LeaderboardStatus
  scoringType: ScoringType
  prizes: LeaderboardPrize[]
  maxParticipants: number
  createdAt: string
  updatedAt: string
}

export interface LeaderboardListParams {
  page?: number
  limit?: number
  status?: LeaderboardStatus | ''
  sortBy?: keyof Leaderboard
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
