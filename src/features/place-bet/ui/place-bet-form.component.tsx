import { useEffect, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatPrice } from '@/entities/auction'
import {
  createBetSchema,
  getDefaultBetPrice,
  type BetConstraints,
  type BetFormValues,
} from '../model/bet-schema'
import styles from './place-bet-form.module.css'

type PlaceBetFormProps = {
  constraints: BetConstraints
  hint: {
    availableLabel: string
    stepLabel: string
    minLabel: string
    maxLabel: string
    currentLabel: string
  }
  isSubmitting: boolean
  serverError?: string | null
  fieldErrors?: Record<string, string>
  onSubmit: (values: BetFormValues) => Promise<void> | void
}

export function PlaceBetForm({
  constraints,
  hint,
  isSubmitting,
  serverError,
  fieldErrors,
  onSubmit,
}: PlaceBetFormProps) {
  const schema = useMemo(() => createBetSchema(constraints), [constraints])
  const defaultPrice = getDefaultBetPrice(constraints)

  const form = useForm<BetFormValues>({
    resolver: zodResolver(schema) as Resolver<BetFormValues>,
    defaultValues: {
      price: defaultPrice,
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    form.reset({
      price: defaultPrice,
    })
  }, [defaultPrice, form])

  useEffect(() => {
    if (!fieldErrors) return
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field === 'price') {
        form.setError('price', { type: 'server', message })
      }
    }
  }, [fieldErrors, form])

  const priceError = form.formState.errors.price?.message

  return (
    <form
      className={styles.form}
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values)
      })}
      noValidate
    >
      <div className={styles.hints}>
        <div>
          <span>Текущая</span>
          <strong>{hint.currentLabel}</strong>
        </div>
        <div>
          <span>Доступно</span>
          <strong>{hint.availableLabel}</strong>
        </div>
        <div>
          <span>Шаг</span>
          <strong>{hint.stepLabel}</strong>
        </div>
        <div>
          <span>Min / Max</span>
          <strong>
            {hint.minLabel} — {hint.maxLabel}
          </strong>
        </div>
      </div>

      <label className={styles.field}>
        <span>Цена ставки, ₽</span>
        <input
          type="number"
          step={constraints.step && constraints.step > 0 ? constraints.step : 'any'}
          inputMode="decimal"
          {...form.register('price', { valueAsNumber: true })}
          aria-invalid={Boolean(priceError)}
        />
        {priceError ? <em className={styles.error}>{priceError}</em> : null}
      </label>

      {defaultPrice != null ? (
        <p className={styles.note}>
          Рекомендуемое значение: {formatPrice(defaultPrice)}
        </p>
      ) : null}

      {serverError ? <p className={styles.serverError}>{serverError}</p> : null}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? 'Отправка…' : 'Отправить ставку'}
      </button>
    </form>
  )
}
