import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wheelApi, wheelKeys } from '../api'
import type { Wheel, WheelListParams, PaginatedResponse } from '../types'
import type { WheelFormValues } from '../schemas'

export function useWheels(params: WheelListParams = {}) {
  return useQuery({
    queryKey: wheelKeys.list(params),
    queryFn: () => wheelApi.getAll(params),
  })
}

export function useWheel(id: string) {
  return useQuery({
    queryKey: wheelKeys.detail(id),
    queryFn: () => wheelApi.getById(id),
    enabled: Boolean(id),
  })
}

export function useCreateWheel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WheelFormValues) => wheelApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: wheelKeys.lists() })
    },
  })
}

export function useUpdateWheel(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WheelFormValues) => wheelApi.update(id, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: wheelKeys.detail(id) })
      const previousWheel = queryClient.getQueryData<Wheel>(wheelKeys.detail(id))
      if (previousWheel) {
        queryClient.setQueryData<Wheel>(wheelKeys.detail(id), {
          ...previousWheel,
          ...newData,
          id: previousWheel.id,
          updatedAt: new Date().toISOString(),
          segments: newData.segments.map((s, i) => ({
            ...s,
            id: previousWheel.segments[i]?.id ?? s.id ?? String(i),
          })),
        })
      }
      return { previousWheel }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.previousWheel) {
        queryClient.setQueryData(wheelKeys.detail(id), ctx.previousWheel)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: wheelKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: wheelKeys.detail(id) })
    },
  })
}

export function useDeleteWheel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => wheelApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: wheelKeys.lists() })
      const snapshot = queryClient.getQueriesData<PaginatedResponse<Wheel>>({
        queryKey: wheelKeys.lists(),
      })
      queryClient.setQueriesData<PaginatedResponse<Wheel>>(
        { queryKey: wheelKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter((w) => w.id !== id),
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
      void queryClient.invalidateQueries({ queryKey: wheelKeys.lists() })
    },
  })
}
