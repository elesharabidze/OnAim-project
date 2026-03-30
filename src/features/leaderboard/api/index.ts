import apiClient from '@/lib/apiClient'
import { generateId } from '@/shared/utils'
import type { LeaderboardFormValues } from '../schemas'
import type { Leaderboard, LeaderboardListParams, PaginatedResponse } from '../types'

function toPrizePayload(prizes: LeaderboardFormValues['prizes']) {
  return prizes.map((p, i) => ({
    ...p,
    id: p.id ?? generateId(),
    rank: i + 1,
  }))
}

function toISODate(dateStr: string): string {
  return new Date(dateStr).toISOString()
}

export const leaderboardApi = {
  getAll: (params: LeaderboardListParams = {}) => {
    const { page = 1, limit = 10, status, sortBy, sortOrder } = params
    const p: Record<string, unknown> = { _page: page, _limit: limit }
    if (status) p.status = status
    if (sortBy) p._sort = sortBy
    if (sortOrder) p._order = sortOrder

    return apiClient
      .get<Leaderboard[]>('/leaderboards', { params: p })
      .then((r) => ({
        data: r.data,
        total: parseInt((r.headers['x-total-count'] as string) ?? String(r.data.length), 10),
        page,
        limit,
      } satisfies PaginatedResponse<Leaderboard>))
  },

  getById: (id: string) =>
    apiClient.get<Leaderboard>(`/leaderboards/${id}`).then((r) => r.data),

  create: (data: LeaderboardFormValues) => {
    const now = new Date().toISOString()
    const payload = {
      ...data,
      startDate: toISODate(data.startDate),
      endDate: toISODate(data.endDate),
      prizes: toPrizePayload(data.prizes),
      createdAt: now,
      updatedAt: now,
    }
    return apiClient.post<Leaderboard>('/leaderboards', payload).then((r) => r.data)
  },

  update: (id: string, data: LeaderboardFormValues) => {
    const payload = {
      ...data,
      startDate: toISODate(data.startDate),
      endDate: toISODate(data.endDate),
      prizes: toPrizePayload(data.prizes),
      updatedAt: new Date().toISOString(),
    }
    return apiClient.put<Leaderboard>(`/leaderboards/${id}`, payload).then((r) => r.data)
  },

  remove: (id: string) =>
    apiClient.delete(`/leaderboards/${id}`).then((r) => r.data),

  bulkUpdateStatus: (ids: string[], status: Leaderboard['status']) =>
    Promise.all(
      ids.map((id) =>
        apiClient
          .patch<Leaderboard>(`/leaderboards/${id}`, {
            status,
            updatedAt: new Date().toISOString(),
          })
          .then((r) => r.data)
      )
    ),
}

export const leaderboardKeys = {
  all: ['leaderboards'] as const,
  lists: () => [...leaderboardKeys.all, 'list'] as const,
  list: (params: LeaderboardListParams) => [...leaderboardKeys.lists(), params] as const,
  details: () => [...leaderboardKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaderboardKeys.details(), id] as const,
}
