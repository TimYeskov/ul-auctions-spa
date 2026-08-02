import type {
  AuctionListItem,
  AuctionShowResponse,
  BetItem,
} from '@/shared/api/types'

/** Текущий пользователь мока (для your.* и ставок). */
export const CURRENT_USER = {
  subscriberId: 13,
  organizationId: 14,
  organizationInn: '9616244307',
  organizationName: 'ООО Перевозчик',
  contactName: 'Иванов Иван',
  contactPhone: '+79001234567',
} as const

export const VAT_RATE = 1.2

export type MockAuctionRecord = {
  uuid: string
  listItem: AuctionListItem
  detail: AuctionShowResponse
  bets: BetItem[]
}

export const AUCTION_STATUS_CODE: Record<string, number> = {
  Planning: 1,
  Auction: 2,
  DeterminateWinner: 3,
  WaitDeal: 4,
  InProgress: 5,
  Finished: 6,
  Stopped: 7,
  Canceled: 8,
  Unknown: 0,
}

export const TRADING_STATUS_CODE: Record<string, number> = {
  NotParticipating: 1,
  Leading: 2,
  Losing: 3,
  Winner: 4,
  Confirmed: 5,
  OnPending: 6,
  ChoosingWinner: 7,
  Accepted: 8,
  Unknown: 0,
}

export function withoutVat(priceWithVat: number) {
  return Math.round((priceWithVat / VAT_RATE) * 100) / 100
}

export function withVat(priceNoVat: number) {
  return Math.round(priceNoVat * VAT_RATE * 100) / 100
}
