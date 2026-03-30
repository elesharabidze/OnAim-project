import apiClient from '@/lib/apiClient'
import { generateId } from '@/shared/utils'
import type { WheelFormValues } from '../schemas'
import type { Wheel, WheelListParams, PaginatedResponse } from '../types'

function toSegmentPayload(segments: WheelFormValues['segments']) {
  return segments.map((s) => ({
    ...s,
    id: s.id ?? generateId(),
  }))
}

export const wheelApi = {
  getAll: (params: WheelListParams = {}) => {
    const { page = 1, limit = 10, status, sortBy, sortOrder } = params
    const p: Record<string, unknown> = { _page: page, _limit: limit }
    if (status) p.status = status
    if (sortBy) p._sort = sortBy
    if (sortOrder) p._order = sortOrder

    return apiClient
      .get<Wheel[]>('/wheels', { params: p })
      .then((r) => ({
        data: r.data,
        total: parseInt((r.headers['x-total-count'] as string) ?? String(r.data.length), 10),
        page,
        limit,
      } satisfies PaginatedResponse<Wheel>))
  },

  getById: (id: string) =>
    apiClient.get<Wheel>(`/wheels/${id}`).then((r) => r.data),

  create: (data: WheelFormValues) => {
    const now = new Date().toISOString()
    const payload = {
      ...data,
      segments: toSegmentPayload(data.segments),
      createdAt: now,
      updatedAt: now,
    }
    return apiClient.post<Wheel>('/wheels', payload).then((r) => r.data)
  },

  update: (id: string, data: WheelFormValues) => {
    const payload = {
      ...data,
      segments: toSegmentPayload(data.segments),
      updatedAt: new Date().toISOString(),
    }
    return apiClient.put<Wheel>(`/wheels/${id}`, payload).then((r) => r.data)
  },

  remove: (id: string) =>
    apiClient.delete(`/wheels/${id}`).then((r) => r.data),
}

export const wheelKeys = {
  all: ['wheels'] as const,
  lists: () => [...wheelKeys.all, 'list'] as const,
  list: (params: WheelListParams) => [...wheelKeys.lists(), params] as const,
  details: () => [...wheelKeys.all, 'detail'] as const,
  detail: (id: string) => [...wheelKeys.details(), id] as const,
}
