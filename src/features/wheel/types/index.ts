export type WheelStatus = 'draft' | 'active' | 'inactive'
export type WheelPrizeType = 'coins' | 'freeSpin' | 'bonus' | 'nothing'

export interface WheelSegment {
  id: string
  label: string
  color: string
  weight: number
  prizeType: WheelPrizeType
  prizeAmount: number
  imageUrl: string
}

export interface Wheel {
  id: string
  name: string
  description: string
  status: WheelStatus
  segments: WheelSegment[]
  maxSpinsPerUser: number
  spinCost: number
  backgroundColor: string
  borderColor: string
  createdAt: string
  updatedAt: string
}

export interface WheelListParams {
  page?: number
  limit?: number
  status?: WheelStatus | ''
  sortBy?: keyof Wheel
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
