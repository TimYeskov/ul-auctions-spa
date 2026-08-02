import type { AuctionListItem } from '@/shared/api/types'
import {
  AUCTION_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
  TRADING_STATUS_LABELS,
} from './labels'
import { formatDateTime, formatPrice, formatRoute } from './format'

export type AuctionPrimaryActionKind =
  | 'place_bet'
  | 'change_bet'
  | 'view_bets'
  | 'view_detail'
  | 'disabled'

export type AuctionPrimaryAction = {
  kind: AuctionPrimaryActionKind
  label: string
  disabled: boolean
  to:
    | '/auctions/$auctionUuid'
    | '/auctions/$auctionUuid/bets'
    | '/auctions/$auctionUuid/bet'
}

export type AuctionListCardViewModel = {
  uuid: string
  id: number | null
  cargoNum: string
  aucTypeLabel: string
  statusLabel: string
  statusMobileLabel: string
  routeLabel: string
  loadDateLabel: string
  unloadDateLabel: string
  cargoName: string
  cargoMeta: string
  currentPriceLabel: string
  pricePerKmLabel: string
  ownBetLabel: string
  hasOwnBet: boolean
  isAvailable: boolean
  canSetBet: boolean
  primaryAction: AuctionPrimaryAction
}

export function resolvePrimaryAction(
  item: AuctionListItem,
): AuctionPrimaryAction {
  const canSetBet = Boolean(item.trading?.can_set_bet)
  const hasOwnBet = Boolean(item.trading?.your?.bet)

  if (canSetBet && !hasOwnBet) {
    return {
      kind: 'place_bet',
      label: 'Сделать ставку',
      disabled: false,
      to: '/auctions/$auctionUuid/bet',
    }
  }

  if (canSetBet && hasOwnBet) {
    return {
      kind: 'change_bet',
      label: 'Изменить ставку',
      disabled: false,
      to: '/auctions/$auctionUuid/bet',
    }
  }

  if (item.trading?.status === 'Planning') {
    return {
      kind: 'view_detail',
      label: 'Смотреть',
      disabled: false,
      to: '/auctions/$auctionUuid',
    }
  }

  if (!canSetBet && !hasOwnBet && item.trading?.status === 'Stopped') {
    return {
      kind: 'disabled',
      label: 'Ставка недоступна',
      disabled: true,
      to: '/auctions/$auctionUuid',
    }
  }

  return {
    kind: 'view_bets',
    label: 'Смотреть ставки',
    disabled: false,
    to: '/auctions/$auctionUuid/bets',
  }
}

export function mapAuctionListItem(
  item: AuctionListItem,
): AuctionListCardViewModel | null {
  const uuid = item.main?.order_uid
  if (!uuid) return null

  const aucType = item.main?.auc_type ?? 'Unknown'
  const status = item.trading?.status ?? 'Unknown'
  const statusMobile = item.trading?.status_mobile ?? 'Unknown'
  const weight = item.cargo?.weight
  const volume = item.cargo?.volume
  const body = item.cargo?.body_type

  const cargoMetaParts = [
    weight != null ? `${weight} т` : null,
    volume != null ? `${volume} м³` : null,
    body || null,
  ].filter(Boolean)

  return {
    uuid,
    id: item.main?.id ?? null,
    cargoNum: item.main?.cargo_num ?? '—',
    aucTypeLabel: AUCTION_TYPE_LABELS[aucType],
    statusLabel: AUCTION_STATUS_LABELS[status],
    statusMobileLabel: TRADING_STATUS_LABELS[statusMobile],
    routeLabel: formatRoute(item.route?.load?.city, item.route?.unload?.city),
    loadDateLabel: formatDateTime(item.route?.load?.date),
    unloadDateLabel: formatDateTime(item.route?.unload?.date),
    cargoName: item.cargo?.name ?? 'Груз',
    cargoMeta: cargoMetaParts.join(' · ') || '—',
    currentPriceLabel: formatPrice(item.trading?.price?.current),
    pricePerKmLabel: formatPrice(item.main?.price_per_km, '₽/км'),
    ownBetLabel: item.trading?.your?.bet
      ? `Моя ставка: ${formatPrice(item.trading.your.last_bet)}`
      : 'Моей ставки нет',
    hasOwnBet: Boolean(item.trading?.your?.bet),
    isAvailable: Boolean(item.trading?.is_available),
    canSetBet: Boolean(item.trading?.can_set_bet),
    primaryAction: resolvePrimaryAction(item),
  }
}
