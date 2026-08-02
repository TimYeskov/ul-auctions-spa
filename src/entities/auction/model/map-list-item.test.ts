import { describe, expect, it } from 'vitest'
import type { AuctionListItem } from '@/shared/api/types'
import { mapAuctionListItem, resolvePrimaryAction } from './map-list-item'

function item(
  overrides: {
    trading?: Partial<NonNullable<AuctionListItem['trading']>>
    main?: Partial<NonNullable<AuctionListItem['main']>>
    route?: AuctionListItem['route']
    cargo?: AuctionListItem['cargo']
  } = {},
): AuctionListItem {
  return {
    main: {
      order_uid: '3a05d045-0e67-4f85-b20a-de81d18bba7a',
      cargo_num: '00000001059',
      auc_type: 'Down',
      ...overrides.main,
    },
    trading: {
      status: 'Auction',
      status_mobile: 'NotParticipating',
      can_set_bet: false,
      your: { bet: false, last_bet: null },
      ...overrides.trading,
    },
    route: overrides.route ?? {
      load: { city: 'Пермь', date: '2026-05-26T09:00:00' },
      unload: { city: 'Москва', date: '2026-05-28T09:00:00' },
    },
    cargo: overrides.cargo ?? {
      name: 'Мороженое',
      weight: 12,
      volume: 40,
      body_type: 'реф',
    },
  }
}

describe('resolvePrimaryAction', () => {
  it('returns place bet when allowed and no own bet', () => {
    const action = resolvePrimaryAction(
      item({ trading: { can_set_bet: true, your: { bet: false } } }),
    )
    expect(action.kind).toBe('place_bet')
    expect(action.to).toBe('/auctions/$auctionUuid/bet')
  })

  it('returns change bet when own bet exists', () => {
    const action = resolvePrimaryAction(
      item({ trading: { can_set_bet: true, your: { bet: true, last_bet: 28000 } } }),
    )
    expect(action.kind).toBe('change_bet')
  })

  it('returns view bets when betting is closed', () => {
    const action = resolvePrimaryAction(
      item({ trading: { can_set_bet: false, your: { bet: true } } }),
    )
    expect(action.kind).toBe('view_bets')
  })
})

describe('mapAuctionListItem', () => {
  it('maps list DTO to card view model', () => {
    const vm = mapAuctionListItem(
      item({
        trading: {
          can_set_bet: true,
          price: { current: 30000, start: 40000, current_no_vat: 25000 },
        },
        main: { price_per_km: 16.39 },
      }),
    )

    expect(vm?.uuid).toBe('3a05d045-0e67-4f85-b20a-de81d18bba7a')
    expect(vm?.routeLabel).toBe('Пермь → Москва')
    expect(vm?.aucTypeLabel).toBe('На понижение')
    expect(vm?.currentPriceLabel).toContain('30')
    expect(vm?.primaryAction.kind).toBe('place_bet')
  })
})
