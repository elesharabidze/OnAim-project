import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leaderboardApi, leaderboardKeys } from '../api'
import type { Leaderboard, LeaderboardListParams, PaginatedResponse } from '../types'
import type { LeaderboardFormValues } from '../schemas'

export function useLeaderboards(params: LeaderboardListParams = {}) {
  return useQuery({
    queryKey: leaderboardKeys.list(params),
    queryFn: () => leaderboardApi.getAll(params),
  })
}

export function useLeaderboard(id: string) {
  return useQuery({
    queryKey: leaderboardKeys.detail(id),
    queryFn: () => leaderboardApi.getById(id),
    enabled: Boolean(id),
  })
}

export function useCreateLeaderboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LeaderboardFormValues) => leaderboardApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leaderboardKeys.lists() })
    },
  })
}

export function useUpdateLeaderboard(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LeaderboardFormValues) => leaderboardApi.update(id, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: leaderboardKeys.detail(id) })
      const previousLeaderboard = queryClient.getQueryData<Leaderboard>(leaderboardKeys.detail(id))
      if (previousLeaderboard) {
        queryClient.setQueryData<Leaderboard>(leaderboardKeys.detail(id), {
          ...previousLeaderboard,
          ...newData,
          id: previousLeaderboard.id,
          updatedAt: new Date().toISOString(),
          prizes: newData.prizes.map((p, i) => ({
            ...p,
            id: previousLeaderboard.prizes[i]?.id ?? p.id ?? String(i),
            rank: previousLeaderboard.prizes[i]?.rank ?? i + 1,
          })),
        })
      }
      return { previousLeaderboard }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.previousLeaderboard) {
        queryClient.setQueryData(leaderboardKeys.detail(id), ctx.previousLeaderboard)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: leaderboardKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: leaderboardKeys.detail(id) })
    },
  })
}

export function useDeleteLeaderboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leaderboardApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: leaderboardKeys.lists() })
      const snapshot = queryClient.getQueriesData<PaginatedResponse<Leaderboard>>({
        queryKey: leaderboardKeys.lists(),
      })
      queryClient.setQueriesData<PaginatedResponse<Leaderboard>>(
        { queryKey: leaderboardKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter((l) => l.id !== id),
            total: Math.max(0, old.total - 1),
          }
        }
      )
      return { snapshot }
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: leaderboardKeys.lists() })
    },
  })
}

export function useBulkUpdateLeaderboardStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'active' | 'draft' | 'completed' }) =>
      leaderboardApi.bulkUpdateStatus(ids, status),
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey: leaderboardKeys.lists() })
      const snapshot = queryClient.getQueriesData<PaginatedResponse<Leaderboard>>({
        queryKey: leaderboardKeys.lists(),
      })
      queryClient.setQueriesData<PaginatedResponse<Leaderboard>>(
        { queryKey: leaderboardKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map((l) =>
              ids.includes(l.id) ? { ...l, status } : l
            ),
          }
        }
      )
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: leaderboardKeys.lists() })
    },
  })
}
