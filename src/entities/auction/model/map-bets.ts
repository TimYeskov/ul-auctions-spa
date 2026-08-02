import type { BetItem } from '@/shared/api/types'
import { formatDateTime, formatPrice } from './format'

export type BetListItemViewModel = {
  id: number
  createdAtLabel: string
  organizationName: string
  organizationInn: string
  contactLabel: string
  priceWithVatLabel: string
  priceNoVatLabel: string
  placeLabel: string
  isWin: boolean
  isRejected: boolean
  isCounter: boolean
  isCancelled: boolean
  cancelReason: string | null
  isOwn: boolean
  comment: string | null
}

export type BetListViewModel = {
  items: BetListItemViewModel[]
  totalCount: number
  participantsCount: number
  winnersCount: number
  cancelledCount: number
}

export function mapBetItem(
  bet: BetItem,
  currentOrganizationId?: number,
): BetListItemViewModel | null {
  if (bet.id == null) return null

  const cancelReason = bet.cancel_reason?.trim() || null
  const isCancelled = Boolean(cancelReason)
  const phone = bet.contact_phone?.trim()
  const contactName = bet.contact_name?.trim() || 'Контакт'

  return {
    id: bet.id,
    createdAtLabel: formatDateTime(bet.created_at),
    organizationName: bet.organization_name?.trim() || 'Перевозчик',
    organizationInn: bet.organization_inn?.trim() || '—',
    contactLabel: phone ? `${contactName} · ${phone}` : contactName,
    priceWithVatLabel: formatPrice(bet.price_with_vat),
    priceNoVatLabel: formatPrice(bet.price_no_vat),
    placeLabel: bet.place != null ? String(bet.place) : '—',
    isWin: Boolean(bet.is_win),
    isRejected: Boolean(bet.is_rejected),
    isCounter: Boolean(bet.is_counter),
    isCancelled,
    cancelReason,
    isOwn:
      currentOrganizationId != null &&
      bet.organization_id === currentOrganizationId,
    comment: bet.transporter_comment?.trim() || null,
  }
}

export function mapBetList(
  bets: BetItem[] | undefined,
  currentOrganizationId?: number,
): BetListViewModel {
  const items = (bets ?? [])
    .map((bet) => mapBetItem(bet, currentOrganizationId))
    .filter((bet): bet is BetListItemViewModel => bet != null)
    .sort((a, b) => {
      const placeA = Number(a.placeLabel)
      const placeB = Number(b.placeLabel)
      const hasPlaceA = Number.isFinite(placeA)
      const hasPlaceB = Number.isFinite(placeB)
      if (hasPlaceA && hasPlaceB) return placeA - placeB
      if (hasPlaceA) return -1
      if (hasPlaceB) return 1
      return b.id - a.id
    })

  const participants = new Set(
    (bets ?? [])
      .map((bet) => bet.organization_id)
      .filter((id): id is number => id != null),
  )

  return {
    items,
    totalCount: items.length,
    participantsCount: participants.size,
    winnersCount: items.filter((item) => item.isWin).length,
    cancelledCount: items.filter((item) => item.isCancelled || item.isRejected)
      .length,
  }
}
