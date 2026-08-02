import { useMutation, useQueryClient } from '@tanstack/react-query'
import { auctionQueryKeys, auctionsApi } from '@/shared/api'
import type { SetBetRequest } from '@/shared/api/types'

export function usePlaceBet(auctionUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SetBetRequest) => auctionsApi.setBet(auctionUuid, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: auctionQueryKeys.detail(auctionUuid),
        }),
        queryClient.invalidateQueries({
          queryKey: [...auctionQueryKeys.detail(auctionUuid), 'bets'],
        }),
      ])
    },
  })
}
