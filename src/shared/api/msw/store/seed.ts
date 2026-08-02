import type {
  AuctionListItem,
  AuctionShowResponse,
  BetItem,
} from '@/shared/api/types'
import { CITIES } from './cities'
import {
  CURRENT_USER,
  withoutVat,
  type MockAuctionRecord,
} from './constants'
import {
  applyPriceAfterBet,
  recalculateBetPlaces,
  syncYourState,
} from './filter-auctions'

const [perm, moscow, kazan, ekb, novosibirsk, samara, spb] = CITIES

let nextBetId = 100

function createBet(partial: Partial<BetItem> & Pick<BetItem, 'auction_id' | 'price_with_vat'>): BetItem {
  const priceWithVat = partial.price_with_vat ?? 0
  const priceNoVat = partial.price_no_vat ?? withoutVat(priceWithVat)
  const id = partial.id ?? nextBetId++

  return {
    id,
    created_at: partial.created_at ?? '2026-05-25T16:05:00',
    auction_id: partial.auction_id,
    subscriber_id: partial.subscriber_id ?? 99,
    contact_name: partial.contact_name ?? 'Петров Пётр',
    contact_phone: partial.contact_phone ?? '+79007654321',
    price_with_vat: priceWithVat,
    price_no_vat: priceNoVat,
    organization_id: partial.organization_id ?? 88,
    organization_inn: partial.organization_inn ?? '7700123456',
    organization_name: partial.organization_name ?? 'ООО Конкурент',
    transporter_comment: partial.transporter_comment ?? null,
    is_rejected: partial.is_rejected ?? false,
    is_counter: partial.is_counter ?? false,
    place: partial.place ?? null,
    is_win: partial.is_win ?? false,
    run_number: partial.run_number ?? 0,
    cancel_reason: partial.cancel_reason ?? '',
    price_info: {
      price_with_vat: priceWithVat,
      price_no_vat: priceNoVat,
      payment_type: 'Безналичная с НДС',
      vat_rate: '20',
    },
  }
}

function buildRecord(input: {
  uuid: string
  listItem: AuctionListItem
  detail: AuctionShowResponse
  bets?: BetItem[]
}): MockAuctionRecord {
  let bets = recalculateBetPlaces(input.bets ?? [], input.detail.main.auc_type)
  let synced = syncYourState(input.listItem, input.detail, bets)

  return {
    uuid: input.uuid,
    listItem: synced.listItem,
    detail: {
      ...synced.detail,
      hide_bets_history:
        synced.detail.hide_bets_history ??
        synced.detail.trading.hide_bets_history ??
        false,
    },
    bets,
  }
}

function baseOrganizer() {
  return {
    subscriber_id: 98,
    organization_id: 340,
    organization_name: 'ЛИМ',
    organization_inn: '7703769184',
    organization_kpp: '770301001',
    is_hide_organization: false,
  }
}

function showOrganizer() {
  return {
    subscriber_id: 98,
    subscriber_code: '12345',
    infobase_code: 'RU_Cargo_01',
    organization_name: 'ЛИМ',
    organization_inn: '7703769184',
    organization_kpp: '770301001',
    organization_id: 340,
  }
}

function payment() {
  return {
    form: 'Безналичная с НДС',
    currency_code: '643',
  }
}

function showPayment() {
  return {
    condition: 'По оригиналам накладных (ТН, ТТН, CMR)',
    condition_predefined: 'ПоОригиналамНаладных',
    form: 'Безналичная с НДС',
    delay: 30,
    delay_type: 'CalendarDays' as const,
    currency_code: '643',
    prepay: '0',
  }
}

function cargoList(overrides: Partial<NonNullable<AuctionListItem['cargo']>> = {}) {
  return {
    name: 'Мороженое',
    weight: 12,
    volume: 40,
    body_type: 'рефрижератор',
    truck_count: 1,
    is_cargo: true,
    is_international: false,
    containered: false,
    loading_types: { side: true, top: false, rear: true, full: false },
    docs: { tir: false, cmr: false, t1: false, med: true },
    car: {
      type: 'Тягач',
      weight: 20,
      volume: 82,
      width: 2.4,
      length: 13.6,
      height: 2.7,
    },
    ...overrides,
  }
}

function cargoShow(distance: number) {
  return {
    price: '0',
    currency: 643,
    is_international: false,
    distance,
    truck_count: 1,
    body_type: 'рефрижератор',
    temp_from: -18,
    temp_to: -18,
    conics: null,
    belts: null,
    adr: null,
    coupling: null,
    air_pass: null,
    low_loader: null,
    additional_load: null,
    containered: false,
    container_type: null,
    container_size: null,
    loading_types: { side: true, top: false, rear: true, full: false },
    docs: { tir: false, cmr: false, t1: false, med: true },
    car: {
      type: 'Тягач',
      weight: 20,
      volume: 82,
      width: 2.4,
      length: 13.6,
      height: 2.7,
    },
  }
}

function routePoints(
  loadCity: (typeof CITIES)[number],
  unloadCity: (typeof CITIES)[number],
  loadDate: string,
  unloadDate: string,
  cargoName: string,
) {
  return [
    {
      row_num: 1,
      op_type: 'Loading' as const,
      start_date: loadDate,
      end_date: loadDate.replace('T09:00:00', 'T18:00:00'),
      comment: null,
      contractor: '',
      contractor_inn: '',
      location: {
        city_name: loadCity.name,
        city_full_name: `${loadCity.name}, Россия`,
        city_gc_id: loadCity.gcId,
        loading_address: 'Складская 1',
        lon: 56.238,
        lat: 58.01,
      },
      cargo: {
        name: cargoName,
        package_name: '',
        weight: '12.000',
        volume: '40.000',
        length: '0',
        width: '0',
        height: '0',
        oversized: false,
        package_amount: null,
      },
      contact: { name: 'Склад погрузки', phone: '+79001112233' },
    },
    {
      row_num: 2,
      op_type: 'Unloading' as const,
      start_date: unloadDate,
      end_date: unloadDate.replace('T09:00:00', 'T18:00:00'),
      comment: null,
      contractor: '',
      contractor_inn: '',
      location: {
        city_name: unloadCity.name,
        city_full_name: `${unloadCity.name}, Россия`,
        city_gc_id: unloadCity.gcId,
        loading_address: 'Промышленная 10',
        lon: 37.618,
        lat: 55.751,
      },
      cargo: {
        name: cargoName,
        package_name: '',
        weight: '12.000',
        volume: '40.000',
        length: '0',
        width: '0',
        height: '0',
        oversized: false,
        package_amount: null,
      },
      contact: { name: 'Склад выгрузки', phone: '+79004445566' },
    },
  ]
}

function createAuction(params: {
  id: number
  uuid: string
  cargoNum: string
  aucType: NonNullable<AuctionListItem['main']>['auc_type']
  status: NonNullable<NonNullable<AuctionListItem['trading']>['status']>
  loadCity: (typeof CITIES)[number]
  unloadCity: (typeof CITIES)[number]
  loadDate: string
  unloadDate: string
  startTime: string
  stopTime: string
  startPrice: number
  currentPrice: number
  step?: number
  canSetBet?: boolean
  isAvailable?: boolean
  isFavorite?: boolean
  hideBetsHistory?: boolean
  hidePoints?: boolean
  cargoName?: string
  distance?: number
  weight?: number
  volume?: number
  bodyType?: string
  bets?: BetItem[]
}): MockAuctionRecord {
  const step = params.step ?? 500
  const distance = params.distance ?? 1500
  const cargoName = params.cargoName ?? 'Мороженое'
  const available =
    params.aucType === 'Up'
      ? params.currentPrice + step
      : Math.max(0, params.currentPrice - step)
  const currentNoVat = withoutVat(params.currentPrice)
  const pricePerKm =
    distance > 0 ? Math.round((currentNoVat / distance) * 100) / 100 : 0

  const listItem: AuctionListItem = {
    main: {
      id: params.id,
      cargo_num: params.cargoNum,
      cargo_date: '2026-05-04T14:49:09',
      auc_type: params.aucType,
      order_uid: params.uuid,
      created_at: '2026-05-25T11:48:20',
      priority_sort: 0,
      is_assembly: false,
      price_per_km: pricePerKm,
    },
    organizer: baseOrganizer(),
    route: {
      load: {
        city: params.loadCity.name,
        address: 'Складская 1',
        date: params.loadDate,
        city_gc_id: params.loadCity.gcId,
        points_count: 1,
      },
      unload: {
        city: params.unloadCity.name,
        address: 'Промышленная 10',
        date: params.unloadDate,
        city_gc_id: params.unloadCity.gcId,
        points_count: 1,
      },
    },
    cargo: cargoList({
      name: cargoName,
      weight: params.weight ?? 12,
      volume: params.volume ?? 40,
      body_type: params.bodyType ?? 'рефрижератор',
    }),
    trading: {
      status: params.status,
      status_mobile: 'NotParticipating',
      start_time: params.startTime,
      stop_time: params.stopTime,
      bid_measurement_type: 'PerRoute',
      can_set_bet: params.canSetBet ?? params.status === 'Auction',
      allow_counter_bets: true,
      hide_points_address_and_contacts: params.hidePoints ?? false,
      is_bidder: false,
      is_available: params.isAvailable ?? params.status === 'Auction',
      is_accredited: true,
      is_favorite: params.isFavorite ?? false,
      price: {
        start: params.startPrice,
        current: params.currentPrice,
        current_no_vat: currentNoVat,
      },
      your: { bet: false, last_bet: null },
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      is_last_bet_with_vat: true,
    },
    payment: payment(),
  }

  const detail: AuctionShowResponse = {
    main: {
      id: params.id,
      cargo_num: params.cargoNum,
      cargo_date: '2026-05-04T14:49:09',
      order_uid: params.uuid,
      auc_type: params.aucType,
      created_at: '2026-05-25T11:48:20',
    },
    organizer: showOrganizer(),
    contacts: [
      {
        name: 'Сидоров Алексей',
        phone: '+79005556677',
        work_phone: null,
        uid: '550e8400-e29b-41d4-a716-446655440001',
        email: 'sidorov@lim.example',
      },
    ],
    cargo: {
      ...cargoShow(distance),
      body_type: params.bodyType ?? 'рефрижератор',
    },
    trading: {
      status: params.status,
      status_mobile: 'NotParticipating',
      start_time: params.startTime,
      stop_time: params.stopTime,
      bid_measurement_type: 'PerRoute',
      can_set_bet: params.canSetBet ?? params.status === 'Auction',
      allow_counter_bets: true,
      hide_bets_history: params.hideBetsHistory ?? false,
      hide_places: false,
      no_view_cargo_price: false,
      hide_points_address_and_contacts: params.hidePoints ?? false,
      is_bidder: false,
      is_favorite: params.isFavorite ?? false,
      is_last_bet_with_vat: true,
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      send_deal_before_load: false,
      chat_id: null,
      price: {
        start: params.startPrice,
        start_no_vat: withoutVat(params.startPrice),
        current: params.currentPrice,
        current_no_vat: currentNoVat,
        available,
        available_no_vat: withoutVat(available),
        min: params.aucType === 'Down' ? Math.max(0, params.startPrice - 20000) : params.startPrice,
        min_no_vat: withoutVat(
          params.aucType === 'Down' ? Math.max(0, params.startPrice - 20000) : params.startPrice,
        ),
        max: params.aucType === 'Up' ? params.startPrice + 20000 : params.startPrice,
        max_no_vat: withoutVat(
          params.aucType === 'Up' ? params.startPrice + 20000 : params.startPrice,
        ),
        step,
        step_no_vat: withoutVat(step),
        price_per_km: pricePerKm,
      },
      your: {
        bet: false,
        last_bet: null,
        last_bet_with_vat: null,
        win: false,
      },
      settings: {
        prolong_after_bet: 10,
        winner_confirm: 1,
        winner_counter_mode: null,
        transmission_time_in: 24,
        coefficient: 10,
      },
    },
    payment: showPayment(),
    assembly: { num: null, date: null },
    routes: routePoints(
      params.loadCity,
      params.unloadCity,
      params.loadDate,
      params.unloadDate,
      cargoName,
    ),
    admitted_organizations: [
      {
        id: CURRENT_USER.organizationId,
        inn: CURRENT_USER.organizationInn,
        is_main: true,
        name: CURRENT_USER.organizationName,
        full_name: 'Общество с ограниченной ответственностью Перевозчик',
        site: null,
        subscriber_id: CURRENT_USER.subscriberId,
        subscriber_code: '54321',
        subscriber_role: null,
        infobase_code: 'RU_Cargo_01',
        infobase_address: null,
        nalog_key: null,
        hide_me: false,
        current_vat_rate: '20',
      },
    ],
    hide_bets_history: params.hideBetsHistory ?? false,
  }

  return buildRecord({
    uuid: params.uuid,
    listItem,
    detail,
    bets: params.bets,
  })
}

export function createSeedAuctions(): MockAuctionRecord[] {
  nextBetId = 100

  const openDownUuid = '3a05d045-0e67-4f85-b20a-de81d18bba7a'
  const userLeadingUuid = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
  const noBetUuid = '11111111-1111-4111-8111-111111111111'
  const hiddenBetsUuid = '22222222-2222-4222-8222-222222222222'
  const cannotBetUuid = '33333333-3333-4333-8333-333333333333'
  const finishedUuid = '44444444-4444-4444-8444-444444444444'
  const fixPriceUuid = '55555555-5555-4555-8555-555555555555'
  const emptyBetsUuid = '66666666-6666-4666-8666-666666666666'

  const openDown = createAuction({
    id: 1001,
    uuid: openDownUuid,
    cargoNum: '00000001059',
    aucType: 'Down',
    status: 'Auction',
    loadCity: perm!,
    unloadCity: moscow!,
    loadDate: '2026-05-26T09:00:00',
    unloadDate: '2026-05-28T09:00:00',
    startTime: '2026-05-25T16:00:00',
    stopTime: '2026-05-26T18:00:00',
    startPrice: 40000,
    currentPrice: 30000,
    canSetBet: true,
    isAvailable: true,
    bets: [
      createBet({
        id: 41,
        auction_id: 1001,
        price_with_vat: 32000,
        created_at: '2026-05-25T16:05:00',
      }),
      createBet({
        id: 42,
        auction_id: 1001,
        price_with_vat: 30000,
        created_at: '2026-05-25T16:10:00',
        organization_id: 77,
        organization_name: 'ООО Быстрая Доставка',
        organization_inn: '7700987654',
        contact_name: 'Козлов Игорь',
      }),
    ],
  })

  const userLeading = createAuction({
    id: 1002,
    uuid: userLeadingUuid,
    cargoNum: '00000001060',
    aucType: 'Down',
    status: 'Auction',
    loadCity: kazan!,
    unloadCity: spb!,
    loadDate: '2026-05-27T09:00:00',
    unloadDate: '2026-05-29T09:00:00',
    startTime: '2026-05-25T12:00:00',
    stopTime: '2026-05-27T12:00:00',
    startPrice: 50000,
    currentPrice: 28000,
    canSetBet: true,
    isAvailable: true,
    isFavorite: true,
    cargoName: 'Продукты питания',
    bodyType: 'тентованный',
    weight: 18,
    volume: 82,
    bets: [
      createBet({
        id: 51,
        auction_id: 1002,
        price_with_vat: 30000,
        created_at: '2026-05-25T12:10:00',
      }),
      createBet({
        id: 52,
        auction_id: 1002,
        price_with_vat: 28000,
        created_at: '2026-05-25T12:20:00',
        subscriber_id: CURRENT_USER.subscriberId,
        organization_id: CURRENT_USER.organizationId,
        organization_inn: CURRENT_USER.organizationInn,
        organization_name: CURRENT_USER.organizationName,
        contact_name: CURRENT_USER.contactName,
        contact_phone: CURRENT_USER.contactPhone,
      }),
    ],
  })

  const noBetAllowed = createAuction({
    id: 1003,
    uuid: cannotBetUuid,
    cargoNum: '00000001061',
    aucType: 'Down',
    status: 'Auction',
    loadCity: ekb!,
    unloadCity: novosibirsk!,
    loadDate: '2026-05-30T09:00:00',
    unloadDate: '2026-06-01T09:00:00',
    startTime: '2026-05-25T10:00:00',
    stopTime: '2026-05-30T10:00:00',
    startPrice: 60000,
    currentPrice: 45000,
    canSetBet: false,
    isAvailable: false,
    cargoName: 'Металлопрокат',
    bodyType: 'открытый',
    weight: 20,
    volume: 30,
    bets: [
      createBet({
        auction_id: 1003,
        price_with_vat: 45000,
      }),
    ],
  })

  const hiddenBets = createAuction({
    id: 1004,
    uuid: hiddenBetsUuid,
    cargoNum: '00000001062',
    aucType: 'Down',
    status: 'Auction',
    loadCity: samara!,
    unloadCity: moscow!,
    loadDate: '2026-06-02T09:00:00',
    unloadDate: '2026-06-03T09:00:00',
    startTime: '2026-05-26T09:00:00',
    stopTime: '2026-06-02T09:00:00',
    startPrice: 35000,
    currentPrice: 31000,
    canSetBet: true,
    isAvailable: true,
    hideBetsHistory: true,
    hidePoints: true,
    cargoName: 'Бытовая химия',
    bets: [
      createBet({
        auction_id: 1004,
        price_with_vat: 31000,
      }),
    ],
  })

  const finished = createAuction({
    id: 1005,
    uuid: finishedUuid,
    cargoNum: '00000001063',
    aucType: 'Down',
    status: 'Finished',
    loadCity: moscow!,
    unloadCity: kazan!,
    loadDate: '2026-05-10T09:00:00',
    unloadDate: '2026-05-11T09:00:00',
    startTime: '2026-05-08T09:00:00',
    stopTime: '2026-05-09T09:00:00',
    startPrice: 25000,
    currentPrice: 20000,
    canSetBet: false,
    isAvailable: false,
    cargoName: 'Упаковка',
    bets: [
      createBet({
        id: 61,
        auction_id: 1005,
        price_with_vat: 20000,
        subscriber_id: CURRENT_USER.subscriberId,
        organization_id: CURRENT_USER.organizationId,
        organization_inn: CURRENT_USER.organizationInn,
        organization_name: CURRENT_USER.organizationName,
        contact_name: CURRENT_USER.contactName,
        contact_phone: CURRENT_USER.contactPhone,
        is_win: true,
      }),
    ],
  })

  const fixPrice = createAuction({
    id: 1006,
    uuid: fixPriceUuid,
    cargoNum: '00000001064',
    aucType: 'FixPrice',
    status: 'Auction',
    loadCity: spb!,
    unloadCity: moscow!,
    loadDate: '2026-06-05T09:00:00',
    unloadDate: '2026-06-06T09:00:00',
    startTime: '2026-05-26T08:00:00',
    stopTime: '2026-06-05T08:00:00',
    startPrice: 22000,
    currentPrice: 22000,
    step: 0,
    canSetBet: true,
    isAvailable: true,
    cargoName: 'Паллеты',
    bodyType: 'фургон',
    weight: 5,
    volume: 20,
    bets: [],
  })

  const emptyBets = createAuction({
    id: 1007,
    uuid: emptyBetsUuid,
    cargoNum: '00000001065',
    aucType: 'Up',
    status: 'Auction',
    loadCity: novosibirsk!,
    unloadCity: ekb!,
    loadDate: '2026-06-10T09:00:00',
    unloadDate: '2026-06-12T09:00:00',
    startTime: '2026-05-27T08:00:00',
    stopTime: '2026-06-10T08:00:00',
    startPrice: 15000,
    currentPrice: 15000,
    canSetBet: true,
    isAvailable: true,
    cargoName: 'Оборудование',
    bodyType: 'тентованный',
    bets: [],
  })

  const requestAuction = createAuction({
    id: 1008,
    uuid: noBetUuid,
    cargoNum: '00000001066',
    aucType: 'Request',
    status: 'Planning',
    loadCity: perm!,
    unloadCity: samara!,
    loadDate: '2026-06-15T09:00:00',
    unloadDate: '2026-06-16T09:00:00',
    startTime: '2026-06-14T09:00:00',
    stopTime: '2026-06-15T09:00:00',
    startPrice: 18000,
    currentPrice: 18000,
    canSetBet: false,
    isAvailable: false,
    cargoName: 'Сборный груз',
    bets: [],
  })

  return [
    openDown,
    userLeading,
    noBetAllowed,
    hiddenBets,
    finished,
    fixPrice,
    emptyBets,
    requestAuction,
  ].map((record) => {
    // ensure price sync for records that already have bets
    const topBet = [...record.bets]
      .filter((bet) => !bet.cancel_reason && !bet.is_rejected)
      .sort((a, b) => {
        const aPrice = a.price_with_vat ?? 0
        const bPrice = b.price_with_vat ?? 0
        return record.detail.main.auc_type === 'Up' ? bPrice - aPrice : aPrice - bPrice
      })[0]

    if (!topBet?.price_with_vat) return record

    const priced = applyPriceAfterBet(
      record.listItem,
      record.detail,
      topBet.price_with_vat,
    )
    const synced = syncYourState(priced.listItem, priced.detail, record.bets)

    return {
      ...record,
      listItem: {
        ...synced.listItem,
        trading: {
          ...synced.listItem.trading,
          can_set_bet: record.listItem.trading?.can_set_bet,
          is_available: record.listItem.trading?.is_available,
        },
      },
      detail: {
        ...synced.detail,
        trading: {
          ...synced.detail.trading,
          can_set_bet: record.detail.trading.can_set_bet,
        },
        hide_bets_history: record.detail.hide_bets_history,
      },
    }
  })
}

export function createNextBetId() {
  return nextBetId++
}
