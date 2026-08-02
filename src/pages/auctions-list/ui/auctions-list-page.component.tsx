import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuctionListCard, mapAuctionListItem } from '@/entities/auction'
import {
  AuctionsFilters,
  cleanSearchParams,
  toAuctionListRequest,
  type AuctionsSearchParams,
} from '@/features/auctions-filters'
import { AuctionsPagination } from '@/features/auctions-pagination'
import { isApiError } from '@/shared/api'
import {
  useAuctionsList,
  usePrefetchAuctionDetail,
} from '../api/use-auctions-list'
import styles from './auctions-list-page.module.css'

export function AuctionsListPage() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const filters = toAuctionListRequest(search)
  const query = useAuctionsList(filters)
  const prefetchDetail = usePrefetchAuctionDetail()

  const setSearch = (next: AuctionsSearchParams) => {
    void navigate({
      search: cleanSearchParams(next),
    })
  }

  const cards =
    query.data?.data
      ?.map((item) => mapAuctionListItem(item))
      .filter((item): item is NonNullable<typeof item> => item != null) ?? []

  const meta = query.data?.meta
  const total = meta?.total ?? 0
  const lastPage = meta?.last_page ?? 1

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Аукционы</h1>
          <p className={styles.subtitle}>
            Список грузовых аукционов с фильтрами и пагинацией
          </p>
        </div>
      </header>

      <AuctionsFilters value={search} onChange={setSearch} />

      <section className={styles.results} aria-live="polite">
        {query.isLoading ? (
          <div className={styles.skeletonList}>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className={styles.skeleton} />
            ))}
          </div>
        ) : null}

        {query.isError ? (
          <div className={styles.state}>
            <h2>Не удалось загрузить список</h2>
            <p>
              {isApiError(query.error)
                ? query.error.message
                : 'Проверьте соединение и попробуйте снова.'}
            </p>
            <button type="button" onClick={() => void query.refetch()}>
              Повторить
            </button>
          </div>
        ) : null}

        {query.isSuccess && cards.length === 0 ? (
          <div className={styles.state}>
            <h2>Ничего не найдено</h2>
            <p>Измените фильтры или сбросьте их.</p>
          </div>
        ) : null}

        {query.isSuccess && cards.length > 0 ? (
          <>
            <div className={styles.list}>
              {cards.map((auction) => (
                <AuctionListCard
                  key={auction.uuid}
                  auction={auction}
                  onPrefetch={prefetchDetail}
                />
              ))}
            </div>
            <AuctionsPagination
              page={search.page}
              lastPage={lastPage}
              total={total}
              perPage={search.per_page}
              onPageChange={(page) => setSearch({ ...search, page })}
              onPerPageChange={(perPage) =>
                setSearch({ ...search, per_page: perPage, page: 1 })
              }
            />
          </>
        ) : null}
      </section>
    </main>
  )
}
