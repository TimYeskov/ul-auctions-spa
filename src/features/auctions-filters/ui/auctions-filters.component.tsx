import { CITIES } from '@/shared/api/msw/store/cities'
import {
  AUCTION_STATUS_FILTER_OPTIONS,
  AUCTION_TYPE_FILTER_OPTIONS,
  AUCTION_TYPE_LABELS,
  TRADING_STATUS_FILTER_OPTIONS,
  TRADING_STATUS_LABELS,
} from '@/entities/auction'
import type { AuctionsSearchParams } from '../model/search-schema'
import { cleanSearchParams } from '../model/to-list-request'
import styles from './auctions-filters.module.css'

type AuctionsFiltersProps = {
  value: AuctionsSearchParams
  onChange: (next: AuctionsSearchParams) => void
}

function toggleInList<T extends string | number>(
  list: T[] | undefined,
  item: T,
): T[] | undefined {
  const current = list ?? []
  const next = current.includes(item)
    ? current.filter((value) => value !== item)
    : [...current, item]
  return next.length ? next : undefined
}

function toDatetimeLocalValue(value: string | undefined) {
  if (!value) return ''
  // Accept ISO with offset or without — keep first 16 chars if possible
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16)
  }
  return ''
}

function fromDatetimeLocalValue(value: string) {
  if (!value) return undefined
  return `${value}:00+03:00`
}

export function AuctionsFilters({ value, onChange }: AuctionsFiltersProps) {
  const update = (patch: Partial<AuctionsSearchParams>) => {
    onChange(
      cleanSearchParams({
        ...value,
        ...patch,
        page: patch.page ?? 1,
      }),
    )
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Номер заявки</span>
          <input
            value={value.cargo_num ?? ''}
            onChange={(event) =>
              update({ cargo_num: event.target.value || undefined })
            }
            placeholder="00000001059"
          />
        </label>

        <label className={styles.field}>
          <span>Город погрузки</span>
          <input
            list="load-cities"
            value={value.load_city ?? ''}
            onChange={(event) =>
              update({ load_city: event.target.value || undefined })
            }
            placeholder="Пермь"
          />
        </label>

        <label className={styles.field}>
          <span>Город выгрузки</span>
          <input
            list="unload-cities"
            value={value.unload_city ?? ''}
            onChange={(event) =>
              update({ unload_city: event.target.value || undefined })
            }
            placeholder="Москва"
          />
        </label>

        <label className={styles.field}>
          <span>Погрузка от</span>
          <input
            type="datetime-local"
            value={toDatetimeLocalValue(value.load_date_from)}
            onChange={(event) =>
              update({
                load_date_from: fromDatetimeLocalValue(event.target.value),
              })
            }
          />
        </label>

        <label className={styles.field}>
          <span>Погрузка до</span>
          <input
            type="datetime-local"
            value={toDatetimeLocalValue(value.load_date_to)}
            onChange={(event) =>
              update({
                load_date_to: fromDatetimeLocalValue(event.target.value),
              })
            }
          />
        </label>

        <label className={styles.field}>
          <span>Цена от</span>
          <input
            type="number"
            min={0}
            value={value.current_price_from ?? ''}
            onChange={(event) =>
              update({
                current_price_from: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
          />
        </label>

        <label className={styles.field}>
          <span>Цена до</span>
          <input
            type="number"
            min={0}
            value={value.current_price_to ?? ''}
            onChange={(event) =>
              update({
                current_price_to: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
          />
        </label>
      </div>

      <fieldset className={styles.fieldset}>
        <legend>Тип аукциона</legend>
        <div className={styles.checks}>
          {AUCTION_TYPE_FILTER_OPTIONS.map((type) => (
            <label key={type} className={styles.check}>
              <input
                type="checkbox"
                checked={value.auc_type?.includes(type) ?? false}
                onChange={() =>
                  update({ auc_type: toggleInList(value.auc_type, type) })
                }
              />
              {AUCTION_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Статус аукциона</legend>
        <div className={styles.checks}>
          {AUCTION_STATUS_FILTER_OPTIONS.map((option) => (
            <label key={option.value} className={styles.check}>
              <input
                type="checkbox"
                checked={value.statuses?.includes(option.value) ?? false}
                onChange={() =>
                  update({
                    statuses: toggleInList(value.statuses, option.value),
                  })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Мой торговый статус</legend>
        <div className={styles.checks}>
          {TRADING_STATUS_FILTER_OPTIONS.map((status) => (
            <label key={status} className={styles.check}>
              <input
                type="checkbox"
                checked={value.status?.includes(status) ?? false}
                onChange={() =>
                  update({ status: toggleInList(value.status, status) })
                }
              />
              {TRADING_STATUS_LABELS[status]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.flags}>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={value.is_available === true}
            onChange={(event) =>
              update({
                is_available: event.target.checked ? true : undefined,
              })
            }
          />
          Только доступные
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={value.is_bidder === true}
            onChange={(event) =>
              update({
                is_bidder: event.target.checked ? true : undefined,
              })
            }
          />
          Только с моим участием
        </label>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.reset}
          onClick={() => onChange({ page: 1, per_page: value.per_page || 10 })}
        >
          Сбросить
        </button>
      </div>

      <datalist id="load-cities">
        {CITIES.map((city) => (
          <option key={`load-${city.gcId}`} value={city.name} />
        ))}
      </datalist>
      <datalist id="unload-cities">
        {CITIES.map((city) => (
          <option key={`unload-${city.gcId}`} value={city.name} />
        ))}
      </datalist>
    </form>
  )
}
