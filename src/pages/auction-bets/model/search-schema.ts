import { z } from 'zod'

const optionalBoolean = z.preprocess((value) => {
  if (value === '' || value == null) return undefined
  if (value === true || value === 'true' || value === '1') return true
  if (value === false || value === 'false' || value === '0') return false
  return undefined
}, z.boolean().optional())

export const auctionBetsSearchSchema = z.object({
  all: optionalBoolean,
})

export type AuctionBetsSearchParams = z.infer<typeof auctionBetsSearchSchema>

export function parseAuctionBetsSearch(search: unknown): AuctionBetsSearchParams {
  const parsed = auctionBetsSearchSchema.safeParse(search)
  if (parsed.success) return parsed.data
  return {}
}
