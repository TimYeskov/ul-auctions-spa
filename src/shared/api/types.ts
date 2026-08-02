import type { components } from './generated/openapi'

export type Schemas = components['schemas']

export type AuctionListRequest = Schemas['AuctionListRequest']
export type AuctionListResponse = Schemas['AuctionListResponseBase']
export type AuctionListMeta = Schemas['AuctionListMeta']
export type AuctionListItem = Schemas['AuctionListItem']

export type AuctionShowResponse = Schemas['AuctionShowResponse']
export type AuctionShowMain = Schemas['AuctionShowMain']
export type AuctionShowTrading = Schemas['AuctionShowTrading']
export type AuctionShowTradingPrice = Schemas['AuctionShowTradingPrice']
export type AuctionShowTradingSettings = Schemas['AuctionShowTradingSettings']
export type AuctionShowTradingYour = Schemas['AuctionShowTradingYour']

export type BetListResponse = Schemas['BetListResponse']
export type BetItem = Schemas['BetItem']
export type SetBetRequest = Schemas['SetBetRequest']

export type AuctionStatus = Schemas['AuctionStatus']
export type AuctionType = Schemas['AuctionType']
export type TradingStatus = Schemas['TradingStatus']
export type BidMeasurementType = Schemas['BidMeasurementType']
export type PaymentDelayType = Schemas['PaymentDelayType']
export type OperationType = Schemas['OperationType']

export type ProblemDetail = Schemas['ProblemDetail']
export type ValidationProblem = Schemas['ValidationProblem']
export type ValidationError = Schemas['ValidationError']

export const AUCTION_STATUSES = [
  'Planning',
  'Auction',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
  'Canceled',
  'Unknown',
] as const satisfies readonly AuctionStatus[]

export const AUCTION_TYPES = [
  'Request',
  'Up',
  'Down',
  'FixPrice',
  'Unknown',
] as const satisfies readonly AuctionType[]

export const TRADING_STATUSES = [
  'NotParticipating',
  'Leading',
  'Losing',
  'OnPending',
  'Confirmed',
  'ChoosingWinner',
  'Winner',
  'Accepted',
  'Unknown',
] as const satisfies readonly TradingStatus[]
