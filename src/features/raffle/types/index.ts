export type RaffleStatus = 'draft' | 'active' | 'drawn' | 'cancelled'
export type PrizeType = 'coins' | 'freeSpin' | 'bonus'

export interface RafflePrize {
  id: string
  name: string
  type: PrizeType
  amount: number
  quantity: number
  imageUrl: string
}

export interface Raffle {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  drawDate: string
  status: RaffleStatus
  ticketPrice: number
  maxTicketsPerUser: number
  prizes: RafflePrize[]
  totalTicketLimit: number | null
  createdAt: string
  updatedAt: string
}

export interface RaffleListParams {
  page?: number
  limit?: number
  status?: RaffleStatus | ''
  startDateFrom?: string
  startDateTo?: string
  sortBy?: keyof Raffle
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
