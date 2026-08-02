export function formatPrice(value: number | null | undefined, currency = '₽') {
  if (value == null || Number.isNaN(value)) return '—'
  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(value)} ${currency}`
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRoute(
  loadCity: string | undefined,
  unloadCity: string | undefined,
) {
  const load = loadCity?.trim() || '—'
  const unload = unloadCity?.trim() || '—'
  return `${load} → ${unload}`
}
