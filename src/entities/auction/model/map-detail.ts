import type {
  AuctionShowResponse,
  BidMeasurementType,
  OperationType,
  PaymentDelayType,
} from '@/shared/api/types'
import {
  AUCTION_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
  TRADING_STATUS_LABELS,
} from './labels'
import { formatDateTime, formatPrice } from './format'

const BID_MEASUREMENT_LABELS: Record<BidMeasurementType, string> = {
  PerRoute: 'За рейс',
  PerKm: 'За км',
  Unknown: '—',
}

const PAYMENT_DELAY_LABELS: Record<Exclude<PaymentDelayType, null>, string> = {
  CalendarDays: 'календарных дней',
  WorkDays: 'рабочих дней',
  Unknown: '',
}

const OPERATION_LABELS: Record<OperationType, string> = {
  Loading: 'Погрузка',
  Unloading: 'Выгрузка',
  Unknown: 'Точка',
}

export type AuctionDetailAction = {
  kind: 'place_bet' | 'change_bet' | 'view_bets' | 'none'
  label: string
  to?: '/auctions/$auctionUuid/bet' | '/auctions/$auctionUuid/bets'
  disabled: boolean
}

export type AuctionDetailViewModel = {
  uuid: string
  cargoNum: string
  aucTypeLabel: string
  statusLabel: string
  statusMobileLabel: string
  createdAtLabel: string
  tradingPeriodLabel: string
  bidMeasurementLabel: string
  organizer: {
    name: string
    inn: string
    kpp: string
  }
  contacts: Array<{
    name: string
    phone: string
    email: string
  }>
  showContacts: boolean
  cargo: {
    bodyType: string
    distanceLabel: string
    truckCountLabel: string
    temperatureLabel: string
    cargoPriceLabel: string | null
    requirements: string[]
    loadingTypes: string[]
    docs: string[]
    carLabel: string
  }
  payment: {
    form: string
    condition: string
    delayLabel: string
    prepay: string
  }
  trading: {
    currentLabel: string
    currentNoVatLabel: string
    availableLabel: string
    startLabel: string
    minLabel: string
    maxLabel: string
    stepLabel: string
    pricePerKmLabel: string
    yourBetLabel: string
    canSetBet: boolean
    hasOwnBet: boolean
    isWinner: boolean
  }
  routes: Array<{
    key: string
    title: string
    city: string
    periodLabel: string
    address: string | null
    contact: string | null
    cargoName: string
    weightVolume: string
  }>
  hidePointsAddressAndContacts: boolean
  primaryAction: AuctionDetailAction
  secondaryBetsAction: AuctionDetailAction | null
  hideBetsHistory: boolean
}

function boolFlags(
  source: Record<string, boolean | null | undefined>,
  labels: Record<string, string>,
) {
  return Object.entries(labels)
    .filter(([key]) => Boolean(source[key]))
    .map(([, label]) => label)
}

export function resolveDetailActions(
  detail: AuctionShowResponse,
): Pick<AuctionDetailViewModel, 'primaryAction' | 'secondaryBetsAction' | 'hideBetsHistory'> {
  const canSetBet = Boolean(detail.trading.can_set_bet)
  const hasOwnBet = Boolean(detail.trading.your?.bet)
  const hideBetsHistory = Boolean(
    detail.hide_bets_history ?? detail.trading.hide_bets_history,
  )

  let primaryAction: AuctionDetailAction
  if (canSetBet && !hasOwnBet) {
    primaryAction = {
      kind: 'place_bet',
      label: 'Сделать ставку',
      to: '/auctions/$auctionUuid/bet',
      disabled: false,
    }
  } else if (canSetBet && hasOwnBet) {
    primaryAction = {
      kind: 'change_bet',
      label: 'Изменить ставку',
      to: '/auctions/$auctionUuid/bet',
      disabled: false,
    }
  } else if (!hideBetsHistory) {
    primaryAction = {
      kind: 'view_bets',
      label: 'Смотреть ставки',
      to: '/auctions/$auctionUuid/bets',
      disabled: false,
    }
  } else {
    primaryAction = { kind: 'none', label: 'Ставки скрыты', disabled: true }
  }

  const secondaryBetsAction =
    !hideBetsHistory && primaryAction.kind !== 'view_bets'
      ? {
          kind: 'view_bets' as const,
          label: 'История ставок',
          to: '/auctions/$auctionUuid/bets' as const,
          disabled: false,
        }
      : null

  return { primaryAction, secondaryBetsAction, hideBetsHistory }
}

export function mapAuctionDetail(
  detail: AuctionShowResponse,
): AuctionDetailViewModel {
  const uuid = detail.main.order_uid ?? ''
  const hidePoints = Boolean(detail.trading.hide_points_address_and_contacts)
  const hideCargoPrice = Boolean(detail.trading.no_view_cargo_price)
  const actions = resolveDetailActions(detail)

  const price = detail.trading.price
  const your = detail.trading.your
  const cargo = detail.cargo
  const payment = detail.payment

  const delayType = payment.delay_type
  const delayLabel =
    payment.delay != null
      ? `${payment.delay} ${
          delayType ? PAYMENT_DELAY_LABELS[delayType] || '' : ''
        }`.trim()
      : '—'

  return {
    uuid,
    cargoNum: detail.main.cargo_num ?? '—',
    aucTypeLabel: AUCTION_TYPE_LABELS[detail.main.auc_type ?? 'Unknown'],
    statusLabel: AUCTION_STATUS_LABELS[detail.trading.status ?? 'Unknown'],
    statusMobileLabel:
      TRADING_STATUS_LABELS[detail.trading.status_mobile ?? 'Unknown'],
    createdAtLabel: formatDateTime(detail.main.created_at),
    tradingPeriodLabel: `${formatDateTime(detail.trading.start_time)} — ${formatDateTime(detail.trading.stop_time)}`,
    bidMeasurementLabel:
      BID_MEASUREMENT_LABELS[detail.trading.bid_measurement_type ?? 'Unknown'],
    organizer: {
      name: detail.organizer.organization_name ?? '—',
      inn: detail.organizer.organization_inn ?? '—',
      kpp: detail.organizer.organization_kpp ?? '—',
    },
    contacts: (detail.contacts ?? [])
      .map((contact) => ({
        name: contact.name?.trim() || 'Контакт',
        phone: contact.phone?.trim() || contact.work_phone?.trim() || '—',
        email: contact.email?.trim() || '—',
      }))
      .filter(() => !hidePoints),
    showContacts: !hidePoints && (detail.contacts?.length ?? 0) > 0,
    cargo: {
      bodyType: cargo.body_type ?? '—',
      distanceLabel:
        cargo.distance != null ? `${cargo.distance} км` : '—',
      truckCountLabel:
        cargo.truck_count != null ? String(cargo.truck_count) : '—',
      temperatureLabel:
        cargo.temp_from != null || cargo.temp_to != null
          ? `${cargo.temp_from ?? '—'}…${cargo.temp_to ?? '—'} °C`
          : '—',
      cargoPriceLabel: hideCargoPrice
        ? null
        : cargo.price != null && cargo.price !== ''
          ? `${cargo.price}`
          : '—',
      requirements: boolFlags(
        {
          coupling: cargo.coupling,
          air_pass: cargo.air_pass,
          low_loader: cargo.low_loader,
          additional_load: cargo.additional_load,
          containered: cargo.containered,
          is_international: cargo.is_international,
        },
        {
          coupling: 'Сцепка',
          air_pass: 'Воздушный путь',
          low_loader: 'Низкорамный',
          additional_load: 'Догруз',
          containered: 'Контейнер',
          is_international: 'Международная',
        },
      ),
      loadingTypes: boolFlags(
        {
          side: cargo.loading_types?.side,
          top: cargo.loading_types?.top,
          rear: cargo.loading_types?.rear,
          full: cargo.loading_types?.full,
        },
        {
          side: 'Боковая',
          top: 'Верхняя',
          rear: 'Задняя',
          full: 'Полная',
        },
      ),
      docs: boolFlags(
        {
          tir: cargo.docs?.tir,
          cmr: cargo.docs?.cmr,
          t1: cargo.docs?.t1,
          med: cargo.docs?.med,
        },
        {
          tir: 'TIR',
          cmr: 'CMR',
          t1: 'T1',
          med: 'Мед. книжка',
        },
      ),
      carLabel: cargo.car
        ? [
            cargo.car.type,
            cargo.car.weight != null ? `${cargo.car.weight} т` : null,
            cargo.car.volume != null ? `${cargo.car.volume} м³` : null,
            cargo.car.length != null && cargo.car.width != null && cargo.car.height != null
              ? `${cargo.car.length}×${cargo.car.width}×${cargo.car.height} м`
              : null,
          ]
            .filter(Boolean)
            .join(' · ') || '—'
        : '—',
    },
    payment: {
      form: payment.form ?? '—',
      condition: payment.condition ?? '—',
      delayLabel,
      prepay: payment.prepay ?? '—',
    },
    trading: {
      currentLabel: formatPrice(price?.current),
      currentNoVatLabel: formatPrice(price?.current_no_vat),
      availableLabel: formatPrice(price?.available),
      startLabel: formatPrice(price?.start),
      minLabel: formatPrice(price?.min),
      maxLabel: formatPrice(price?.max),
      stepLabel: formatPrice(price?.step),
      pricePerKmLabel: formatPrice(price?.price_per_km, '₽/км'),
      yourBetLabel: your?.bet
        ? formatPrice(your.last_bet_with_vat ?? your.last_bet)
        : 'Нет',
      canSetBet: Boolean(detail.trading.can_set_bet),
      hasOwnBet: Boolean(your?.bet),
      isWinner: Boolean(your?.win),
    },
    routes: (detail.routes ?? []).map((point, index) => {
      const op = point.op_type ?? 'Unknown'
      const address = hidePoints
        ? null
        : point.location?.loading_address?.trim() || null
      const contact = hidePoints
        ? null
        : [point.contact?.name, point.contact?.phone]
            .map((value) => value?.trim())
            .filter(Boolean)
            .join(', ') || null

      return {
        key: `${point.row_num ?? index}-${op}`,
        title: `${OPERATION_LABELS[op]}${point.row_num != null ? ` #${point.row_num}` : ''}`,
        city:
          point.location?.city_full_name ||
          point.location?.city_name ||
          '—',
        periodLabel: `${formatDateTime(point.start_date)} — ${formatDateTime(point.end_date)}`,
        address,
        contact,
        cargoName: point.cargo?.name ?? '—',
        weightVolume: [
          point.cargo?.weight ? `${point.cargo.weight} т` : null,
          point.cargo?.volume ? `${point.cargo.volume} м³` : null,
        ]
          .filter(Boolean)
          .join(' · ') || '—',
      }
    }),
    ...actions,
    hidePointsAddressAndContacts: hidePoints,
  }
}
