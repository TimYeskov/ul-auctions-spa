import styles from './auctions-pagination.module.css'

type AuctionsPaginationProps = {
  page: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export function AuctionsPagination({
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
}: AuctionsPaginationProps) {
  return (
    <div className={styles.bar}>
      <p className={styles.summary}>
        Всего: {total}. Страница {page} из {lastPage}
      </p>
      <div className={styles.controls}>
        <label className={styles.perPage}>
          На странице
          <select
            value={perPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
          >
            {[5, 10, 20].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Назад
        </button>
        <button
          type="button"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Вперёд
        </button>
      </div>
    </div>
  )
}
