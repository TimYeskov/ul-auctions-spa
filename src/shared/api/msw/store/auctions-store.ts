import type {
  AuctionListRequest,
  SetBetRequest,
  ValidationError,
} from '@/shared/api/types'
import { CURRENT_USER, withoutVat, type MockAuctionRecord } from './constants'
import {
  applyPriceAfterBet,
  filterAndPaginate,
  recalculateBetPlaces,
  syncYourState,
} from './filter-auctions'
import { createNextBetId, createSeedAuctions } from './seed'

function cloneRecords(records: MockAuctionRecord[]): MockAuctionRecord[] {
  return structuredClone(records)
}

class AuctionsStore {
  private records: MockAuctionRecord[]

  constructor(seed: MockAuctionRecord[] = createSeedAuctions()) {
    this.records = cloneRecords(seed)
  }

  reset(seed: MockAuctionRecord[] = createSeedAuctions()) {
    this.records = cloneRecords(seed)
  }

  list(filters: AuctionListRequest = {}) {
    return filterAndPaginate(this.records, filters)
  }

  getByUuid(auctionUuid: string) {
    return this.records.find((record) => record.uuid === auctionUuid) ?? null
  }

  listBets(auctionUuid: string, all = false) {
    const record = this.getByUuid(auctionUuid)
    if (!record) return null

    if (record.detail.hide_bets_history || record.detail.trading.hide_bets_history) {
      return { bets: [] as MockAuctionRecord['bets'] }
    }

    const bets = all
      ? record.bets
      : record.bets.filter((bet) => !bet.cancel_reason && !bet.is_rejected)

    return { bets }
  }

  setBet(auctionUuid: string, body: SetBetRequest) {
    const record = this.getByUuid(auctionUuid)
    if (!record) {
      return { ok: false as const, status: 404 as const }
    }

    const validationErrors = validateSetBet(record, body)
    if (validationErrors.length > 0) {
      return {
        ok: false as const,
        status: 422 as const,
        errors: validationErrors,
      }
    }

    if (!record.detail.trading.can_set_bet) {
      return {
        ok: false as const,
        status: 422 as const,
        errors: [
          {
            field: 'price',
            message: 'Ставка недоступна для этого аукциона.',
            code: 'cannot_set_bet',
          },
        ] satisfies ValidationError[],
      }
    }

    const price = body.price
    const priceNoVat = withoutVat(price)
    const auctionId = record.detail.main.id ?? record.listItem.main?.id ?? 0

    const bet = {
      id: createNextBetId(),
      created_at: new Date().toISOString().slice(0, 19),
      auction_id: auctionId,
      subscriber_id: CURRENT_USER.subscriberId,
      contact_name: CURRENT_USER.contactName,
      contact_phone: CURRENT_USER.contactPhone,
      price_with_vat: price,
      price_no_vat: priceNoVat,
      organization_id: CURRENT_USER.organizationId,
      organization_inn: CURRENT_USER.organizationInn,
      organization_name: CURRENT_USER.organizationName,
      transporter_comment: null,
      is_rejected: false,
      is_counter: false,
      place: null,
      is_win: false,
      run_number: 0,
      cancel_reason: '',
      price_info: {
        price_with_vat: price,
        price_no_vat: priceNoVat,
        payment_type: 'Безналичная с НДС',
        vat_rate: '20',
      },
    }

    const bets = recalculateBetPlaces(
      [...record.bets, bet],
      record.detail.main.auc_type,
    )
    const priced = applyPriceAfterBet(record.listItem, record.detail, price)
    const synced = syncYourState(priced.listItem, priced.detail, bets)

    record.bets = bets
    record.listItem = synced.listItem
    record.detail = {
      ...synced.detail,
      hide_bets_history: record.detail.hide_bets_history,
    }

    return { ok: true as const }
  }
}

function validateSetBet(
  record: MockAuctionRecord,
  body: SetBetRequest,
): ValidationError[] {
  const errors: ValidationError[] = []
  const price = body.price

  if (typeof price !== 'number' || Number.isNaN(price)) {
    errors.push({
      field: 'price',
      message: 'Поле price обязательно и должно быть числом.',
      code: 'required',
    })
    return errors
  }

  if (price <= 0) {
    errors.push({
      field: 'price',
      message: 'Значение должно быть больше 0.',
      code: 'min_value',
    })
  }

  const tradingPrice = record.detail.trading.price
  const available = tradingPrice?.available
  const min = tradingPrice?.min
  const max = tradingPrice?.max
  const step = tradingPrice?.step
  const aucType = record.detail.main.auc_type

  if (available != null) {
    if (aucType === 'Up' && price < available) {
      errors.push({
        field: 'price',
        message: `Ставка должна быть не меньше доступной (${available}).`,
        code: 'min_value',
      })
    }
    if (aucType !== 'Up' && aucType !== 'FixPrice' && price > available) {
      errors.push({
        field: 'price',
        message: `Ставка должна быть не больше доступной (${available}).`,
        code: 'max_value',
      })
    }
    if (aucType === 'FixPrice' && price !== tradingPrice?.current) {
      errors.push({
        field: 'price',
        message: `Для фиксированной цены ставка должна быть равна ${tradingPrice?.current}.`,
        code: 'invalid_value',
      })
    }
  }

  if (min != null && price < min) {
    errors.push({
      field: 'price',
      message: `Значение должно быть не меньше ${min}.`,
      code: 'min_value',
    })
  }

  if (max != null && price > max) {
    errors.push({
      field: 'price',
      message: `Значение должно быть не больше ${max}.`,
      code: 'max_value',
    })
  }

  if (step != null && step > 0 && available != null) {
    const diff = Math.abs(price - available)
    const stepsFromAvailable = diff / step
    if (Math.abs(stepsFromAvailable - Math.round(stepsFromAvailable)) > 1e-6) {
      // allow exact available and current as well as step grid from available
      const fromStart = tradingPrice?.start
      if (fromStart != null) {
        const fromStartSteps = Math.abs(price - fromStart) / step
        if (Math.abs(fromStartSteps - Math.round(fromStartSteps)) > 1e-6) {
          errors.push({
            field: 'price',
            message: `Значение должно быть кратно шагу ${step}.`,
            code: 'step',
          })
        }
      }
    }
  }

  return errors
}

export const auctionsStore = new AuctionsStore()
