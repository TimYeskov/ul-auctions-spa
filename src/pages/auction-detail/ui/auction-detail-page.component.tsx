import { useParams } from '@tanstack/react-router'
import {
  AuctionDetailCargo,
  AuctionDetailHeader,
  AuctionDetailOrganizer,
  AuctionDetailPayment,
  AuctionDetailRoutes,
  AuctionDetailTrading,
  mapAuctionDetail,
} from '@/entities/auction'
import { isApiError } from '@/shared/api'
import { useAuctionDetail } from '../api/use-auction-detail'
import styles from './auction-detail-page.module.css'

export function AuctionDetailPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid' })
  const query = useAuctionDetail(auctionUuid)

  if (query.isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
        <div className={styles.skeletonShort} />
      </main>
    )
  }

  if (query.isError) {
    const notFound = isApiError(query.error) && query.error.isNotFound
    return (
      <main className={styles.page}>
        <div className={styles.state}>
          <h1>{notFound ? 'Аукцион не найден' : 'Ошибка загрузки'}</h1>
          <p>
            {isApiError(query.error)
              ? query.error.message
              : 'Не удалось получить данные аукциона.'}
          </p>
          <button type="button" onClick={() => void query.refetch()}>
            Повторить
          </button>
        </div>
      </main>
    )
  }

  if (!query.data) {
    return null
  }

  const auction = mapAuctionDetail(query.data)

  return (
    <main className={styles.page}>
      <AuctionDetailHeader auction={auction} />
      <div className={styles.columns}>
        <AuctionDetailTrading auction={auction} />
        <AuctionDetailOrganizer auction={auction} />
      </div>
      <AuctionDetailRoutes auction={auction} />
      <div className={styles.columns}>
        <AuctionDetailCargo auction={auction} />
        <AuctionDetailPayment auction={auction} />
      </div>
    </main>
  )
}
