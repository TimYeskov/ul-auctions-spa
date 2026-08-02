import { useQuery, useQueryClient } from '@tanstack/react-query'
import { auctionQueryKeys, auctionsApi } from '@/shared/api'
import type { AuctionListRequest } from '@/shared/api/types'

export function useAuctionsList(filters: AuctionListRequest) {
  return useQuery({
    queryKey: auctionQueryKeys.list(filters),
    queryFn: ({ signal }) => auctionsApi.list(filters, signal),
  })
}

export function usePrefetchAuctionDetail() {
  const queryClient = useQueryClient()

  return (auctionUuid: string) => {
    void queryClient.prefetchQuery({
      queryKey: auctionQueryKeys.detail(auctionUuid),
      queryFn: ({ signal }) => auctionsApi.getById(auctionUuid, signal),
    })
  }
}
