import apiClient from '@/lib/apiClient'
import { generateId } from '@/shared/utils'
import type { RaffleFormValues } from '../schemas'
import type { Raffle, RaffleListParams, PaginatedResponse } from '../types'

function toPrizePayload(prizes: RaffleFormValues['prizes']) {
  return prizes.map((p) => ({
    ...p,
    id: p.id ?? generateId(),
  }))
}

function toISODate(dateStr: string): string {
  return new Date(dateStr).toISOString()
}

export const raffleApi = {
  getAll: (params: RaffleListParams = {}) => {
    const { page = 1, limit = 10, status, startDateFrom, startDateTo, sortBy, sortOrder } = params
    const p: Record<string, unknown> = { _page: page, _limit: limit }
    if (status) p.status = status
    if (startDateFrom) p['startDate_gte'] = startDateFrom
    if (startDateTo) p['startDate_lte'] = startDateTo
    if (sortBy) p._sort = sortBy
    if (sortOrder) p._order = sortOrder

    return apiClient
      .get<Raffle[]>('/raffles', { params: p })
      .then((r) => ({
        data: r.data,
        total: parseInt((r.headers['x-total-count'] as string) ?? String(r.data.length), 10),
        page,
        limit,
      } satisfies PaginatedResponse<Raffle>))
  },

  getById: (id: string) =>
    apiClient.get<Raffle>(`/raffles/${id}`).then((r) => r.data),

  create: (data: RaffleFormValues) => {
    const now = new Date().toISOString()
    const payload = {
      ...data,
      startDate: toISODate(data.startDate),
      endDate: toISODate(data.endDate),
      drawDate: toISODate(data.drawDate),
      prizes: toPrizePayload(data.prizes),
      createdAt: now,
      updatedAt: now,
    }
    return apiClient.post<Raffle>('/raffles', payload).then((r) => r.data)
  },

  update: (id: string, data: RaffleFormValues) => {
    const payload = {
      ...data,
      startDate: toISODate(data.startDate),
      endDate: toISODate(data.endDate),
      drawDate: toISODate(data.drawDate),
      prizes: toPrizePayload(data.prizes),
      updatedAt: new Date().toISOString(),
    }
    return apiClient.put<Raffle>(`/raffles/${id}`, payload).then((r) => r.data)
  },

  remove: (id: string) =>
    apiClient.delete(`/raffles/${id}`).then((r) => r.data),
}

export const raffleKeys = {
  all: ['raffles'] as const,
  lists: () => [...raffleKeys.all, 'list'] as const,
  list: (params: RaffleListParams) => [...raffleKeys.lists(), params] as const,
  details: () => [...raffleKeys.all, 'detail'] as const,
  detail: (id: string) => [...raffleKeys.details(), id] as const,
}
