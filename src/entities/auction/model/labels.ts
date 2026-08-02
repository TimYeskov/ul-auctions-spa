import type {
  AuctionStatus,
  AuctionType,
  TradingStatus,
} from '@/shared/api/types'

export const AUCTION_TYPE_LABELS: Record<AuctionType, string> = {
  Request: 'Заявочный',
  Up: 'На повышение',
  Down: 'На понижение',
  FixPrice: 'Фикс. цена',
  Unknown: 'Неизвестно',
}

export const AUCTION_STATUS_LABELS: Record<AuctionStatus, string> = {
  Planning: 'Планирование',
  Auction: 'Торги',
  DeterminateWinner: 'Определение победителя',
  WaitDeal: 'Ожидание сделки',
  InProgress: 'В работе',
  Finished: 'Завершён',
  Stopped: 'Остановлен',
  Canceled: 'Отменён',
  Unknown: 'Неизвестно',
}

export const TRADING_STATUS_LABELS: Record<TradingStatus, string> = {
  NotParticipating: 'Не участвует',
  Leading: 'Лидирует',
  Losing: 'Перебит',
  OnPending: 'Ожидание',
  Confirmed: 'Подтверждён',
  ChoosingWinner: 'Выбор победителя',
  Winner: 'Победитель',
  Accepted: 'Принят',
  Unknown: 'Неизвестно',
}

export const AUCTION_STATUS_FILTER_OPTIONS: {
  value: number
  label: string
}[] = [
  { value: 1, label: 'Планирование' },
  { value: 2, label: 'Торги' },
  { value: 3, label: 'Определение победителя' },
  { value: 4, label: 'Ожидание сделки' },
  { value: 5, label: 'В работе' },
  { value: 6, label: 'Завершён' },
  { value: 7, label: 'Остановлен' },
  { value: 8, label: 'Отменён' },
]

export const TRADING_STATUS_FILTER_OPTIONS = [
  'NotParticipating',
  'Leading',
  'Losing',
  'Winner',
  'Confirmed',
] as const satisfies readonly TradingStatus[]

export const AUCTION_TYPE_FILTER_OPTIONS = [
  'Request',
  'Up',
  'Down',
  'FixPrice',
] as const satisfies readonly Exclude<AuctionType, 'Unknown'>[]
