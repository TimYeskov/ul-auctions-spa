import { beforeEach, describe, expect, it } from 'vitest'
import { auctionsStore } from './auctions-store'
import { createSeedAuctions } from './seed'

describe('auctionsStore', () => {
  beforeEach(() => {
    auctionsStore.reset(createSeedAuctions())
  })

  it('lists auctions with pagination meta', () => {
    const page1 = auctionsStore.list({ page: 1, per_page: 3 })
    expect(page1.data).toHaveLength(3)
    expect(page1.meta?.total).toBe(8)
    expect(page1.meta?.last_page).toBe(3)
    expect(page1.meta?.current_page).toBe(1)
  })

  it('filters by cargo_num, load_city and is_available', () => {
    const byCargo = auctionsStore.list({ cargo_num: '01059' })
    expect(byCargo.data?.map((item) => item.main?.cargo_num)).toEqual([
      '00000001059',
    ])

    const byCity = auctionsStore.list({ load_city: 'Казань' })
    expect(byCity.data?.every((item) => item.route?.load?.city === 'Казань')).toBe(
      true,
    )

    const available = auctionsStore.list({ is_available: true })
    expect(
      available.data?.every((item) => item.trading?.is_available === true),
    ).toBe(true)
  })

  it('returns detail by uuid and 404 path via null', () => {
    const known = auctionsStore.getByUuid('3a05d045-0e67-4f85-b20a-de81d18bba7a')
    expect(known?.detail.main.cargo_num).toBe('00000001059')
    expect(auctionsStore.getByUuid('00000000-0000-4000-8000-000000000000')).toBeNull()
  })

  it('hides bets history when flag is set', () => {
    const result = auctionsStore.listBets('22222222-2222-4222-8222-222222222222')
    expect(result).toEqual({ bets: [] })
  })

  it('accepts a valid bet and updates price/your/status', () => {
    const uuid = '3a05d045-0e67-4f85-b20a-de81d18bba7a'
    const before = auctionsStore.getByUuid(uuid)!
    const available = before.detail.trading.price?.available ?? 0

    const result = auctionsStore.setBet(uuid, { price: available })
    expect(result.ok).toBe(true)

    const after = auctionsStore.getByUuid(uuid)!
    expect(after.detail.trading.price?.current).toBe(available)
    expect(after.detail.trading.your?.bet).toBe(true)
    expect(after.detail.trading.status_mobile).toBe('Leading')
    expect(after.listItem.trading?.your?.bet).toBe(true)
    expect(after.bets.some((bet) => bet.organization_id === 14)).toBe(true)
  })

  it('rejects invalid bet with validation errors', () => {
    const uuid = '3a05d045-0e67-4f85-b20a-de81d18bba7a'
    const result = auctionsStore.setBet(uuid, { price: 0 })
    expect(result.ok).toBe(false)
    if (!result.ok && result.status === 422) {
      expect(result.errors.some((error) => error.field === 'price')).toBe(true)
    }
  })

  it('rejects bet when can_set_bet is false', () => {
    const result = auctionsStore.setBet(
      '33333333-3333-4333-8333-333333333333',
      { price: 40000 },
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
    }
  })
})
