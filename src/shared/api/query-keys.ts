import type { AuctionListRequest } from './types'
import type { ListBetsParams } from './auctions-api'

export const auctionQueryKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionQueryKeys.all, 'list'] as const,
  list: (filters: AuctionListRequest) =>
    [...auctionQueryKeys.lists(), filters] as const,
  details: () => [...auctionQueryKeys.all, 'detail'] as const,
  detail: (auctionUuid: string) =>
    [...auctionQueryKeys.details(), auctionUuid] as const,
  bets: (auctionUuid: string, params: ListBetsParams = {}) =>
    [...auctionQueryKeys.detail(auctionUuid), 'bets', params] as const,
}
