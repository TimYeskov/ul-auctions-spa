import { describe, expect, it } from 'vitest'
import type { AuctionShowResponse } from '@/shared/api/types'
import { mapAuctionDetail, resolveDetailActions } from './map-detail'

function detail(
  overrides: {
    trading?: Partial<AuctionShowResponse['trading']>
    main?: Partial<AuctionShowResponse['main']>
    hide_bets_history?: boolean
    contacts?: AuctionShowResponse['contacts']
    routes?: AuctionShowResponse['routes']
    cargo?: Partial<AuctionShowResponse['cargo']>
  } = {},
): AuctionShowResponse {
  return {
    main: {
      id: 1001,
      cargo_num: '00000001059',
      order_uid: '3a05d045-0e67-4f85-b20a-de81d18bba7a',
      auc_type: 'Down',
      created_at: '2026-05-25T11:48:20',
      ...overrides.main,
    },
    organizer: {
      organization_name: 'ЛИМ',
      organization_inn: '7703769184',
      organization_kpp: '770301001',
    },
    contacts: overrides.contacts ?? [
      {
        name: 'Иван',
        phone: '+79001112233',
        email: 'ivan@example.com',
      },
    ],
    cargo: {
      body_type: 'рефрижератор',
      distance: 1500,
      truck_count: 1,
      price: '100000',
      loading_types: { rear: true },
      docs: { med: true },
      car: { type: 'Тягач', weight: 20, volume: 82 },
      ...overrides.cargo,
    },
    trading: {
      status: 'Auction',
      status_mobile: 'NotParticipating',
      can_set_bet: true,
      hide_bets_history: false,
      hide_points_address_and_contacts: false,
      no_view_cargo_price: false,
      start_time: '2026-05-25T16:00:00',
      stop_time: '2026-05-26T18:00:00',
      bid_measurement_type: 'PerRoute',
      price: {
        current: 30000,
        available: 29500,
        step: 500,
        min: 20000,
        max: 40000,
        price_per_km: 16.39,
      },
      your: { bet: false, last_bet: null, last_bet_with_vat: null, win: false },
      ...overrides.trading,
    },
    payment: {
      form: 'Безналичная с НДС',
      condition: 'По оригиналам',
      delay: 30,
      delay_type: 'CalendarDays',
      prepay: '0',
    },
    assembly: { num: null, date: null },
    routes: overrides.routes ?? [
      {
        row_num: 1,
        op_type: 'Loading',
        start_date: '2026-05-26T09:00:00',
        end_date: '2026-05-26T18:00:00',
        location: {
          city_name: 'Пермь',
          city_full_name: 'Пермь, Россия',
          loading_address: 'Складская 1',
        },
        contact: { name: 'Склад', phone: '+7900' },
        cargo: { name: 'Мороженое', weight: '12.000', volume: '40.000' },
      },
    ],
    admitted_organizations: [],
    hide_bets_history: overrides.hide_bets_history ?? false,
  }
}

describe('resolveDetailActions', () => {
  it('offers place bet when allowed', () => {
    expect(resolveDetailActions(detail()).primaryAction.kind).toBe('place_bet')
  })

  it('hides bets action when history is hidden', () => {
    const actions = resolveDetailActions(
      detail({
        hide_bets_history: true,
        trading: { can_set_bet: false, hide_bets_history: true },
      }),
    )
    expect(actions.hideBetsHistory).toBe(true)
    expect(actions.primaryAction.kind).toBe('none')
    expect(actions.secondaryBetsAction).toBeNull()
  })
})

describe('mapAuctionDetail', () => {
  it('maps core fields and respects hide flags', () => {
    const vm = mapAuctionDetail(
      detail({
        trading: {
          hide_points_address_and_contacts: true,
          no_view_cargo_price: true,
          can_set_bet: true,
        },
      }),
    )

    expect(vm.cargoNum).toBe('00000001059')
    expect(vm.showContacts).toBe(false)
    expect(vm.cargo.cargoPriceLabel).toBeNull()
    expect(vm.routes[0]?.address).toBeNull()
    expect(vm.routes[0]?.contact).toBeNull()
    expect(vm.routes[0]?.city).toBe('Пермь, Россия')
    expect(vm.hidePointsAddressAndContacts).toBe(true)
  })
})
