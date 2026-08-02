import { apiRequest } from './http-client'
import type {
  AuctionListRequest,
  AuctionListResponse,
  AuctionShowResponse,
  BetListResponse,
  SetBetRequest,
} from './types'

export type ListBetsParams = {
  all?: boolean | null
}

export const auctionsApi = {
  list(body: AuctionListRequest = {}, signal?: AbortSignal) {
    return apiRequest<AuctionListResponse>('auctions/list', {
      method: 'POST',
      body,
      signal,
    })
  },

  getById(auctionUuid: string, signal?: AbortSignal) {
    return apiRequest<AuctionShowResponse>(`auctions/${auctionUuid}`, {
      method: 'GET',
      signal,
    })
  },

  listBets(auctionUuid: string, params: ListBetsParams = {}, signal?: AbortSignal) {
    return apiRequest<BetListResponse>(`auctions/${auctionUuid}/bets`, {
      method: 'GET',
      query: { all: params.all },
      signal,
    })
  },

  setBet(auctionUuid: string, body: SetBetRequest, signal?: AbortSignal) {
    return apiRequest<void>(`auctions/${auctionUuid}/bets`, {
      method: 'POST',
      body,
      signal,
    })
  },
}
