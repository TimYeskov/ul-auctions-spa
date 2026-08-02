import { describe, expect, it } from 'vitest'
import { parseAuctionsSearch } from './search-schema'
import { toAuctionListRequest } from './to-list-request'

describe('parseAuctionsSearch', () => {
  it('applies defaults and coerces values', () => {
    const parsed = parseAuctionsSearch({
      page: '2',
      per_page: '5',
      is_available: 'true',
      auc_type: 'Down,Up',
      statuses: '2,6',
      status: 'Leading',
      cargo_num: '01059',
    })

    expect(parsed.page).toBe(2)
    expect(parsed.per_page).toBe(5)
    expect(parsed.is_available).toBe(true)
    expect(parsed.auc_type).toEqual(['Down', 'Up'])
    expect(parsed.statuses).toEqual([2, 6])
    expect(parsed.status).toEqual(['Leading'])
    expect(parsed.cargo_num).toBe('01059')
  })

  it('falls back safely on invalid input', () => {
    expect(parseAuctionsSearch({ page: 'nope' })).toEqual({
      page: 1,
      per_page: 10,
    })
  })
})

describe('toAuctionListRequest', () => {
  it('maps only defined filters', () => {
    expect(
      toAuctionListRequest({
        page: 1,
        per_page: 10,
        load_city: 'Пермь',
        is_bidder: true,
      }),
    ).toEqual({
      page: 1,
      per_page: 10,
      load_city: 'Пермь',
      is_bidder: true,
    })
  })
})
