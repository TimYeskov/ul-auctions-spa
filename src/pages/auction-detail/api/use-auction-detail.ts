import { useQuery } from '@tanstack/react-query'
import { auctionQueryKeys, auctionsApi } from '@/shared/api'

export function useAuctionDetail(auctionUuid: string) {
  return useQuery({
    queryKey: auctionQueryKeys.detail(auctionUuid),
    queryFn: ({ signal }) => auctionsApi.getById(auctionUuid, signal),
    enabled: Boolean(auctionUuid),
  })
}
