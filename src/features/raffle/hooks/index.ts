import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { raffleApi, raffleKeys } from '../api'
import type { Raffle, RaffleListParams, PaginatedResponse } from '../types'
import type { RaffleFormValues } from '../schemas'

export function useRaffles(params: RaffleListParams = {}) {
  return useQuery({
    queryKey: raffleKeys.list(params),
    queryFn: () => raffleApi.getAll(params),
  })
}

export function useRaffle(id: string) {
  return useQuery({
    queryKey: raffleKeys.detail(id),
    queryFn: () => raffleApi.getById(id),
    enabled: Boolean(id),
  })
}

export function useCreateRaffle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RaffleFormValues) => raffleApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: raffleKeys.lists() })
    },
  })
}

export function useUpdateRaffle(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RaffleFormValues) => raffleApi.update(id, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: raffleKeys.detail(id) })
      const previousRaffle = queryClient.getQueryData<Raffle>(raffleKeys.detail(id))
      if (previousRaffle) {
        queryClient.setQueryData<Raffle>(raffleKeys.detail(id), {
          ...previousRaffle,
          ...newData,
          id: previousRaffle.id,
          updatedAt: new Date().toISOString(),
          prizes: newData.prizes.map((p, i) => ({
            ...p,
            id: previousRaffle.prizes[i]?.id ?? p.id ?? String(i),
          })),
        })
      }
      return { previousRaffle }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.previousRaffle) {
        queryClient.setQueryData(raffleKeys.detail(id), ctx.previousRaffle)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: raffleKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: raffleKeys.detail(id) })
    },
  })
}

export function useDeleteRaffle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => raffleApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: raffleKeys.lists() })
      const snapshot = queryClient.getQueriesData<PaginatedResponse<Raffle>>({
        queryKey: raffleKeys.lists(),
      })
      queryClient.setQueriesData<PaginatedResponse<Raffle>>(
        { queryKey: raffleKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter((r) => r.id !== id),
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
      void queryClient.invalidateQueries({ queryKey: raffleKeys.lists() })
    },
  })
}
