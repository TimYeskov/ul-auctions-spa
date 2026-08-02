import { z } from 'zod'

export type BetConstraints = {
  min?: number | null
  max?: number | null
  step?: number | null
  available?: number | null
  current?: number | null
  aucType?: string | null
}

function isMultipleOfStep(value: number, step: number, base: number) {
  const diff = Math.abs(value - base)
  const steps = diff / step
  return Math.abs(steps - Math.round(steps)) <= 1e-6
}

const priceField = z.preprocess((value) => {
  if (value === '' || value == null) return undefined
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()
    if (!normalized) return undefined
    return Number(normalized)
  }
  return value
}, z.number({ error: 'Укажите цену ставки' }))

export function createBetSchema(constraints: BetConstraints = {}) {
  return z.object({
    price: priceField
      .refine((value) => Number.isFinite(value), {
        message: 'Укажите корректное число',
      })
      .refine((value) => value > 0, {
        message: 'Цена должна быть больше 0',
      })
      .superRefine((value, ctx) => {
        const { min, max, step, available, current, aucType } = constraints

        if (min != null && value < min) {
          ctx.addIssue({
            code: 'custom',
            message: `Минимальная ставка: ${min}`,
          })
        }

        if (max != null && value > max) {
          ctx.addIssue({
            code: 'custom',
            message: `Максимальная ставка: ${max}`,
          })
        }

        if (available != null && aucType === 'Up' && value < available) {
          ctx.addIssue({
            code: 'custom',
            message: `Ставка должна быть не меньше доступной (${available})`,
          })
        }

        if (
          available != null &&
          aucType !== 'Up' &&
          aucType !== 'FixPrice' &&
          value > available
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `Ставка должна быть не больше доступной (${available})`,
          })
        }

        if (aucType === 'FixPrice' && current != null && value !== current) {
          ctx.addIssue({
            code: 'custom',
            message: `Для фиксированной цены ставка должна быть ${current}`,
          })
        }

        if (step != null && step > 0) {
          const base = available ?? current ?? min ?? 0
          if (!isMultipleOfStep(value, step, base)) {
            ctx.addIssue({
              code: 'custom',
              message: `Цена должна быть кратна шагу ${step}`,
            })
          }
        }
      }),
  })
}

export type BetFormValues = {
  price: number
}

export function getDefaultBetPrice(constraints: BetConstraints) {
  if (constraints.aucType === 'FixPrice' && constraints.current != null) {
    return constraints.current
  }
  if (constraints.available != null) return constraints.available
  if (constraints.current != null) return constraints.current
  if (constraints.min != null) return constraints.min
  return undefined
}
