import type { AuctionListRequest } from '@/shared/api/types'
import type { AuctionsSearchParams } from './search-schema'

export function toAuctionListRequest(
  search: AuctionsSearchParams,
): AuctionListRequest {
  const request: AuctionListRequest = {
    page: search.page,
    per_page: search.per_page,
  }

  if (search.cargo_num) request.cargo_num = search.cargo_num
  if (search.load_city) request.load_city = search.load_city
  if (search.unload_city) request.unload_city = search.unload_city
  if (search.load_date_from) request.load_date_from = search.load_date_from
  if (search.load_date_to) request.load_date_to = search.load_date_to
  if (search.current_price_from != null) {
    request.current_price_from = search.current_price_from
  }
  if (search.current_price_to != null) {
    request.current_price_to = search.current_price_to
  }
  if (search.is_available != null) request.is_available = search.is_available
  if (search.is_bidder != null) request.is_bidder = search.is_bidder
  if (search.status?.length) request.status = search.status
  if (search.statuses?.length) request.statuses = search.statuses
  if (search.auc_type?.length) request.auc_type = search.auc_type

  return request
}

export function cleanSearchParams(
  search: AuctionsSearchParams,
): AuctionsSearchParams {
  const next: AuctionsSearchParams = {
    page: search.page || 1,
    per_page: search.per_page || 10,
  }

  if (search.cargo_num) next.cargo_num = search.cargo_num
  if (search.load_city) next.load_city = search.load_city
  if (search.unload_city) next.unload_city = search.unload_city
  if (search.load_date_from) next.load_date_from = search.load_date_from
  if (search.load_date_to) next.load_date_to = search.load_date_to
  if (search.current_price_from != null) {
    next.current_price_from = search.current_price_from
  }
  if (search.current_price_to != null) {
    next.current_price_to = search.current_price_to
  }
  if (search.is_available != null) next.is_available = search.is_available
  if (search.is_bidder != null) next.is_bidder = search.is_bidder
  if (search.status?.length) next.status = search.status
  if (search.statuses?.length) next.statuses = search.statuses
  if (search.auc_type?.length) next.auc_type = search.auc_type

  return next
}
