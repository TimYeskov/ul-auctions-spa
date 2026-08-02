import type {
  AuctionListItem,
  AuctionShowResponse,
  BetItem,
  TradingStatus,
} from '@/shared/api/types'
import {
  AUCTION_STATUS_CODE,
  CURRENT_USER,
  TRADING_STATUS_CODE,
  withoutVat,
  type MockAuctionRecord,
} from './constants'
import type { AuctionListRequest } from '@/shared/api/types'

function includesInsensitive(haystack: string | undefined, needle: string) {
  return (haystack ?? '').toLowerCase().includes(needle.trim().toLowerCase())
}

function parseDate(value: string | undefined | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function inRange(
  value: number | null | undefined,
  from: number | null | undefined,
  to: number | null | undefined,
) {
  if (value == null) return from == null && to == null
  if (from != null && value < from) return false
  if (to != null && value > to) return false
  return true
}

function dateInRange(
  value: string | undefined,
  from: string | undefined,
  to: string | undefined,
) {
  const date = parseDate(value)
  if (!date) return !from && !to
  const fromDate = parseDate(from)
  const toDate = parseDate(to)
  if (fromDate && date < fromDate) return false
  if (toDate && date > toDate) return false
  return true
}

function matchesAuction(record: MockAuctionRecord, filters: AuctionListRequest) {
  const { listItem, detail } = record
  const main = listItem.main
  const trading = listItem.trading
  const cargo = listItem.cargo
  const route = listItem.route
  const organizer = listItem.organizer

  if (filters.cargo_num && !includesInsensitive(main?.cargo_num, filters.cargo_num)) {
    return false
  }

  if (filters.auc_type?.length) {
    const type = main?.auc_type
    if (!type || type === 'Unknown' || !filters.auc_type.includes(type)) {
      return false
    }
  }

  if (filters.status?.length) {
    const status = trading?.status_mobile
    if (!status || !filters.status.includes(status as never)) {
      return false
    }
  }

  if (filters.mobile_statuses?.length) {
    const code = TRADING_STATUS_CODE[trading?.status_mobile ?? 'Unknown']
    if (!filters.mobile_statuses.includes(code)) {
      return false
    }
  }

  if (filters.statuses?.length) {
    const code = AUCTION_STATUS_CODE[trading?.status ?? 'Unknown']
    if (!filters.statuses.includes(code)) {
      return false
    }
  }

  if (filters.load_city && !includesInsensitive(route?.load?.city, filters.load_city)) {
    return false
  }

  if (filters.unload_city && !includesInsensitive(route?.unload?.city, filters.unload_city)) {
    return false
  }

  if (filters.load_gc_id != null && route?.load?.city_gc_id !== filters.load_gc_id) {
    return false
  }

  if (filters.unload_gc_id != null && route?.unload?.city_gc_id !== filters.unload_gc_id) {
    return false
  }

  if (
    !dateInRange(route?.load?.date, filters.load_date_from, filters.load_date_to)
  ) {
    return false
  }

  if (
    !dateInRange(route?.unload?.date, filters.unload_date_from, filters.unload_date_to)
  ) {
    return false
  }

  if (
    !dateInRange(main?.created_at, filters.create_date_from, filters.create_date_to)
  ) {
    return false
  }

  if (
    !dateInRange(trading?.start_time, filters.start_time_from, filters.start_time_to)
  ) {
    return false
  }

  if (
    !dateInRange(trading?.stop_time, filters.stop_time_from, filters.stop_time_to)
  ) {
    return false
  }

  if (filters.is_available != null && trading?.is_available !== filters.is_available) {
    return false
  }

  if (filters.is_bidder != null && trading?.is_bidder !== filters.is_bidder) {
    return false
  }

  if (filters.is_favorite != null && trading?.is_favorite !== filters.is_favorite) {
    return false
  }

  if (
    filters.is_international_shipment != null &&
    Boolean(cargo?.is_international) !== filters.is_international_shipment
  ) {
    return false
  }

  if (!inRange(cargo?.weight, filters.weight_from, filters.weight_to)) {
    return false
  }

  if (!inRange(cargo?.volume, filters.volume_from, filters.volume_to)) {
    return false
  }

  if (
    !inRange(
      trading?.price?.current,
      filters.current_price_from,
      filters.current_price_to,
    )
  ) {
    return false
  }

  if (
    !inRange(main?.price_per_km, filters.price_per_km_from, filters.price_per_km_to)
  ) {
    return false
  }

  if (filters.body_types?.length) {
    const body = cargo?.body_type?.toLowerCase() ?? ''
    if (!filters.body_types.some((type) => body.includes(type.toLowerCase()))) {
      return false
    }
  }

  if (filters.customer) {
    const needle = filters.customer
    const match =
      includesInsensitive(organizer?.organization_name, needle) ||
      includesInsensitive(organizer?.organization_inn, needle)
    if (!match) return false
  }

  if (filters.customer_ids?.length) {
    if (
      organizer?.organization_id == null ||
      !filters.customer_ids.includes(organizer.organization_id)
    ) {
      return false
    }
  }

  if (filters.auction_ids?.length) {
    if (main?.id == null || !filters.auction_ids.includes(main.id)) {
      return false
    }
  }

  // detail-only flag check for completeness
  void detail

  return true
}

function compareNullable(a: number | null | undefined, b: number | null | undefined) {
  const left = a ?? Number.NEGATIVE_INFINITY
  const right = b ?? Number.NEGATIVE_INFINITY
  return left - right
}

function sortRecords(
  records: MockAuctionRecord[],
  filters: AuctionListRequest,
) {
  const sorted = [...records]

  if (filters.sort) {
    const entries = Object.entries(filters.sort)
    sorted.sort((a, b) => {
      for (const [field, direction] of entries) {
        const dir = direction === 'desc' ? -1 : 1
        let result = 0
        if (field === 'start_time') {
          result =
            (parseDate(a.listItem.trading?.start_time)?.getTime() ?? 0) -
            (parseDate(b.listItem.trading?.start_time)?.getTime() ?? 0)
        } else if (field === 'price_per_km') {
          result = compareNullable(
            a.listItem.main?.price_per_km,
            b.listItem.main?.price_per_km,
          )
        } else if (field === 'current_price') {
          result = compareNullable(
            a.listItem.trading?.price?.current,
            b.listItem.trading?.price?.current,
          )
        }
        if (result !== 0) return result * dir
      }
      return 0
    })
    return sorted
  }

  sorted.sort((a, b) => {
    const aTime = parseDate(a.listItem.main?.created_at)?.getTime() ?? 0
    const bTime = parseDate(b.listItem.main?.created_at)?.getTime() ?? 0
    return filters.is_oldest ? aTime - bTime : bTime - aTime
  })

  return sorted
}

export function filterAndPaginate(
  records: MockAuctionRecord[],
  filters: AuctionListRequest = {},
) {
  const page = Math.max(1, filters.page ?? 1)
  const perPage = Math.min(100, Math.max(1, filters.per_page ?? 20))

  const filtered = sortRecords(
    records.filter((record) => matchesAuction(record, filters)),
    filters,
  )

  const total = filtered.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, lastPage)
  const start = (safePage - 1) * perPage
  const slice = filtered.slice(start, start + perPage)

  const from = total === 0 ? 0 : start + 1
  const to = total === 0 ? 0 : start + slice.length

  return {
    data: slice.map((record) => record.listItem),
    meta: {
      current_page: safePage,
      from,
      last_page: lastPage,
      per_page: perPage,
      to,
      total,
    },
  }
}

export function recalculateBetPlaces(bets: BetItem[], aucType: string | undefined) {
  const active = bets.filter((bet) => !bet.cancel_reason && !bet.is_rejected)
  const ranked = [...active].sort((a, b) => {
    const aPrice = a.price_with_vat ?? 0
    const bPrice = b.price_with_vat ?? 0
    if (aucType === 'Up') return bPrice - aPrice
    return aPrice - bPrice
  })

  const placeById = new Map<number, number>()
  ranked.forEach((bet, index) => {
    if (bet.id != null) placeById.set(bet.id, index + 1)
  })

  return bets.map((bet) => ({
    ...bet,
    place: bet.id != null ? (placeById.get(bet.id) ?? null) : null,
    is_win: bet.id != null && placeById.get(bet.id) === 1,
  }))
}

export function syncYourState(
  listItem: AuctionListItem,
  detail: AuctionShowResponse,
  bets: BetItem[],
) {
  const yourBets = bets.filter(
    (bet) =>
      bet.organization_id === CURRENT_USER.organizationId &&
      !bet.cancel_reason &&
      !bet.is_rejected,
  )
  const lastBet = yourBets.at(-1)
  const bestPlace = yourBets
    .map((bet) => bet.place)
    .filter((place): place is number => place != null)
    .sort((a, b) => a - b)[0]

  let statusMobile: TradingStatus = 'NotParticipating'
  if (lastBet) {
    statusMobile = bestPlace === 1 ? 'Leading' : 'Losing'
  }
  if (detail.trading.status === 'Finished' && lastBet?.is_win) {
    statusMobile = 'Winner'
  }

  const yourList = {
    bet: Boolean(lastBet),
    last_bet: lastBet?.price_with_vat ?? null,
  }
  const yourDetail = {
    bet: Boolean(lastBet),
    last_bet: lastBet?.price_no_vat ?? null,
    last_bet_with_vat: lastBet?.price_with_vat ?? null,
    win: Boolean(lastBet?.is_win),
  }

  return {
    listItem: {
      ...listItem,
      trading: {
        ...listItem.trading,
        status_mobile: statusMobile,
        is_bidder: Boolean(lastBet),
        your: yourList,
      },
    },
    detail: {
      ...detail,
      trading: {
        ...detail.trading,
        status_mobile: statusMobile,
        is_bidder: Boolean(lastBet),
        your: yourDetail,
      },
    },
  }
}

export function applyPriceAfterBet(
  listItem: AuctionListItem,
  detail: AuctionShowResponse,
  priceWithVat: number,
) {
  const step = detail.trading.price?.step ?? 500
  const aucType = detail.main.auc_type
  const nextAvailable =
    aucType === 'Up' ? priceWithVat + step : Math.max(0, priceWithVat - step)

  const priceNoVat = withoutVat(priceWithVat)
  const availableNoVat = withoutVat(nextAvailable)
  const distance = detail.cargo.distance ?? 0
  const pricePerKm = distance > 0 ? Math.round((priceNoVat / distance) * 100) / 100 : 0

  return {
    listItem: {
      ...listItem,
      main: {
        ...listItem.main,
        price_per_km: pricePerKm,
      },
      trading: {
        ...listItem.trading,
        is_available: true,
        can_set_bet: true,
        price: {
          start: listItem.trading?.price?.start ?? priceWithVat,
          current: priceWithVat,
          current_no_vat: priceNoVat,
        },
      },
    },
    detail: {
      ...detail,
      trading: {
        ...detail.trading,
        can_set_bet: true,
        price: {
          ...detail.trading.price,
          current: priceWithVat,
          current_no_vat: priceNoVat,
          available: nextAvailable,
          available_no_vat: availableNoVat,
          price_per_km: pricePerKm,
        },
      },
    },
  }
}
