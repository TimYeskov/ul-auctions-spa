import { describe, expect, it } from 'vitest'
import type { BetItem } from '@/shared/api/types'
import { mapBetList } from './map-bets'

const bets: BetItem[] = [
  {
    id: 2,
    created_at: '2026-05-25T16:10:00',
    organization_id: 14,
    organization_name: 'ООО Перевозчик',
    organization_inn: '9616244307',
    contact_name: 'Иванов Иван',
    contact_phone: '+79001234567',
    price_with_vat: 28000,
    price_no_vat: 23333.33,
    place: 1,
    is_win: true,
    cancel_reason: '',
  },
  {
    id: 1,
    created_at: '2026-05-25T16:05:00',
    organization_id: 88,
    organization_name: 'ООО Конкурент',
    organization_inn: '7700123456',
    contact_name: 'Петров',
    price_with_vat: 30000,
    price_no_vat: 25000,
    place: 2,
    is_win: false,
    cancel_reason: 'Отозвана',
  },
]

describe('mapBetList', () => {
  it('maps bets, sorts by place and marks own bet', () => {
    const vm = mapBetList(bets, 14)

    expect(vm.totalCount).toBe(2)
    expect(vm.participantsCount).toBe(2)
    expect(vm.winnersCount).toBe(1)
    expect(vm.cancelledCount).toBe(1)
    expect(vm.items[0]?.id).toBe(2)
    expect(vm.items[0]?.isOwn).toBe(true)
    expect(vm.items[1]?.isCancelled).toBe(true)
    expect(vm.items[1]?.cancelReason).toBe('Отозвана')
  })

  it('handles empty list', () => {
    expect(mapBetList([])).toEqual({
      items: [],
      totalCount: 0,
      participantsCount: 0,
      winnersCount: 0,
      cancelledCount: 0,
    })
  })
})
