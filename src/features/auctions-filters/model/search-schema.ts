import { z } from 'zod'
import {
  AUCTION_TYPE_FILTER_OPTIONS,
  TRADING_STATUS_FILTER_OPTIONS,
} from '@/entities/auction'

const emptyToUndefined = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined
  return value
}

const csvOrArray = z.preprocess((value) => {
  const normalized = emptyToUndefined(value)
  if (normalized === undefined) return undefined
  if (Array.isArray(normalized)) return normalized
  if (typeof normalized === 'string') {
    return normalized
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  }
  return normalized
}, z.array(z.string()).optional())

const numberArray = z.preprocess((value) => {
  const normalized = emptyToUndefined(value)
  if (normalized === undefined) return undefined
  const parts = Array.isArray(normalized)
    ? normalized
    : typeof normalized === 'string'
      ? normalized.split(',')
      : [normalized]
  return parts
    .map((part) => Number(part))
    .filter((part) => Number.isFinite(part))
}, z.array(z.number()).optional())

const optionalBoolean = z.preprocess((value) => {
  const normalized = emptyToUndefined(value)
  if (normalized === undefined) return undefined
  if (normalized === true || normalized === 'true' || normalized === '1') return true
  if (normalized === false || normalized === 'false' || normalized === '0') {
    return false
  }
  return undefined
}, z.boolean().optional())

const optionalNumber = z.preprocess((value) => {
  const normalized = emptyToUndefined(value)
  if (normalized === undefined) return undefined
  const num = Number(normalized)
  return Number.isFinite(num) ? num : undefined
}, z.number().optional())

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().optional(),
)

export const auctionsSearchSchema = z.object({
  page: optionalNumber.pipe(z.number().int().min(1).default(1)),
  per_page: optionalNumber.pipe(z.number().int().min(1).max(100).default(10)),
  cargo_num: optionalString,
  load_city: optionalString,
  unload_city: optionalString,
  load_date_from: optionalString,
  load_date_to: optionalString,
  current_price_from: optionalNumber,
  current_price_to: optionalNumber,
  is_available: optionalBoolean,
  is_bidder: optionalBoolean,
  status: csvOrArray.pipe(
    z.array(z.enum(TRADING_STATUS_FILTER_OPTIONS)).optional(),
  ),
  statuses: numberArray,
  auc_type: csvOrArray.pipe(
    z.array(z.enum(AUCTION_TYPE_FILTER_OPTIONS)).optional(),
  ),
})

export type AuctionsSearchParams = z.infer<typeof auctionsSearchSchema>

export function parseAuctionsSearch(search: unknown): AuctionsSearchParams {
  const parsed = auctionsSearchSchema.safeParse(search)
  if (parsed.success) return parsed.data
  return {
    page: 1,
    per_page: 10,
  }
}
