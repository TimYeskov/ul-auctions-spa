import { describe, expect, it } from 'vitest'
import { createBetSchema, getDefaultBetPrice } from './bet-schema'

describe('createBetSchema', () => {
  it('requires price > 0', () => {
    const schema = createBetSchema()
    expect(schema.safeParse({ price: 0 }).success).toBe(false)
    expect(schema.safeParse({ price: 1000 }).success).toBe(true)
  })

  it('validates available and step for Down auction', () => {
    const schema = createBetSchema({
      aucType: 'Down',
      available: 29500,
      step: 500,
      min: 20000,
      max: 40000,
    })

    expect(schema.safeParse({ price: 29500 }).success).toBe(true)
    expect(schema.safeParse({ price: 30000 }).success).toBe(false)
    expect(schema.safeParse({ price: 29200 }).success).toBe(false)
    expect(schema.safeParse({ price: 29000 }).success).toBe(true)
  })

  it('requires exact current for FixPrice', () => {
    const schema = createBetSchema({
      aucType: 'FixPrice',
      current: 22000,
      available: 22000,
    })
    expect(schema.safeParse({ price: 22000 }).success).toBe(true)
    expect(schema.safeParse({ price: 21000 }).success).toBe(false)
  })
})

describe('getDefaultBetPrice', () => {
  it('prefers available for Down and current for FixPrice', () => {
    expect(
      getDefaultBetPrice({ aucType: 'Down', available: 29000, current: 30000 }),
    ).toBe(29000)
    expect(
      getDefaultBetPrice({ aucType: 'FixPrice', available: 22000, current: 22000 }),
    ).toBe(22000)
  })
})
