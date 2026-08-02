import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { AuctionBetsList, AuctionBetsSummary, mapBetList } from '@/entities/auction'
import { CURRENT_USER } from '@/shared/api/msw/store/constants'
import { isApiError } from '@/shared/api'
import {
  useAuctionBets,
  useAuctionDetailForBets,
} from '../api/use-auction-bets'
import styles from './auction-bets-page.module.css'

export function AuctionBetsPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bets' })
  const search = useSearch({ from: '/auctions/$auctionUuid/bets' })
  const navigate = useNavigate({ from: '/auctions/$auctionUuid/bets' })
  const showAll = search.all === true

  const detailQuery = useAuctionDetailForBets(auctionUuid)
  const betsQuery = useAuctionBets(auctionUuid, showAll)

  const hideBetsHistory = Boolean(
    detailQuery.data?.hide_bets_history ??
      detailQuery.data?.trading.hide_bets_history,
  )
  const hidePlaces = Boolean(detailQuery.data?.trading.hide_places)
  const cargoNum = detailQuery.data?.main.cargo_num ?? auctionUuid
  const canSetBet = Boolean(detailQuery.data?.trading.can_set_bet)

  const isLoading = detailQuery.isLoading || (!hideBetsHistory && betsQuery.isLoading)
  const error = detailQuery.error ?? (!hideBetsHistory ? betsQuery.error : null)

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </main>
    )
  }

  if (error) {
    const notFound = isApiError(error) && error.isNotFound
    return (
      <main className={styles.page}>
        <div className={styles.state}>
          <h1>{notFound ? 'Аукцион не найден' : 'Ошибка загрузки'}</h1>
          <p>
            {isApiError(error)
              ? error.message
              : 'Не удалось получить список ставок.'}
          </p>
          <button
            type="button"
            onClick={() => {
              void detailQuery.refetch()
              void betsQuery.refetch()
            }}
          >
            Повторить
          </button>
        </div>
      </main>
    )
  }

  if (hideBetsHistory) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Аукцион № {cargoNum}</p>
            <h1 className={styles.title}>Ставки</h1>
          </div>
          <div className={styles.actions}>
            <Link
              to="/auctions/$auctionUuid"
              params={{ auctionUuid }}
              className={styles.secondary}
            >
              К деталке
            </Link>
          </div>
        </header>
        <div className={styles.state}>
          <h2>История ставок скрыта</h2>
          <p>Организатор скрыл список ставок для этого аукциона.</p>
        </div>
      </main>
    )
  }

  const list = mapBetList(betsQuery.data?.bets, CURRENT_USER.organizationId)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Аукцион № {cargoNum}</p>
          <h1 className={styles.title}>Ставки</h1>
          <p className={styles.subtitle}>
            {showAll
              ? 'Показаны все ставки, включая отменённые'
              : 'Активные ставки аукциона'}
          </p>
        </div>
        <div className={styles.actions}>
          <Link
            to="/auctions/$auctionUuid"
            params={{ auctionUuid }}
            className={styles.secondary}
          >
            К деталке
          </Link>
          {canSetBet ? (
            <Link
              to="/auctions/$auctionUuid/bet"
              params={{ auctionUuid }}
              className={styles.primary}
            >
              Сделать ставку
            </Link>
          ) : null}
        </div>
      </header>

      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={showAll}
          onChange={(event) =>
            void navigate({
              search: event.target.checked ? { all: true } : {},
            })
          }
        />
        Показать отменённые и отклонённые (`all`)
      </label>

      <AuctionBetsSummary list={list} />
      <AuctionBetsList list={list} hidePlaces={hidePlaces} />
    </main>
  )
}
