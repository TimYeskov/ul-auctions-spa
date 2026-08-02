import { useQuery } from '@tanstack/react-query'
import { auctionQueryKeys, auctionsApi } from '@/shared/api'

export function useAuctionBets(auctionUuid: string, all?: boolean) {
  return useQuery({
    queryKey: auctionQueryKeys.bets(auctionUuid, { all: all ?? null }),
    queryFn: ({ signal }) =>
      auctionsApi.listBets(auctionUuid, { all: all ?? null }, signal),
    enabled: Boolean(auctionUuid),
  })
}

export function useAuctionDetailForBets(auctionUuid: string) {
  return useQuery({
    queryKey: auctionQueryKeys.detail(auctionUuid),
    queryFn: ({ signal }) => auctionsApi.getById(auctionUuid, signal),
    enabled: Boolean(auctionUuid),
  })
}
