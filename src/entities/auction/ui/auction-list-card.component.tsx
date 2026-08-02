import { Link } from '@tanstack/react-router'
import type { AuctionListCardViewModel } from '../model/map-list-item'
import styles from './auction-list-card.module.css'

type AuctionListCardProps = {
  auction: AuctionListCardViewModel
  onPrefetch?: (auctionUuid: string) => void
}

export function AuctionListCard({ auction, onPrefetch }: AuctionListCardProps) {
  const prefetch = () => onPrefetch?.(auction.uuid)

  return (
    <article
      className={styles.card}
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      <div className={styles.top}>
        <div className={styles.identity}>
          <Link
            to="/auctions/$auctionUuid"
            params={{ auctionUuid: auction.uuid }}
            className={styles.cargoNum}
            onMouseEnter={prefetch}
          >
            № {auction.cargoNum}
          </Link>
          <span className={styles.type}>{auction.aucTypeLabel}</span>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>{auction.statusLabel}</span>
          <span
            className={
              auction.hasOwnBet ? styles.badgeAccent : styles.badgeMuted
            }
          >
            {auction.statusMobileLabel}
          </span>
        </div>
      </div>

      <div className={styles.route}>{auction.routeLabel}</div>

      <dl className={styles.meta}>
        <div>
          <dt>Погрузка</dt>
          <dd>{auction.loadDateLabel}</dd>
        </div>
        <div>
          <dt>Выгрузка</dt>
          <dd>{auction.unloadDateLabel}</dd>
        </div>
        <div>
          <dt>Груз</dt>
          <dd>
            {auction.cargoName}
            <span className={styles.subtle}> · {auction.cargoMeta}</span>
          </dd>
        </div>
        <div>
          <dt>Цена</dt>
          <dd>
            {auction.currentPriceLabel}
            <span className={styles.subtle}> · {auction.pricePerKmLabel}</span>
          </dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <Link
          to="/auctions/$auctionUuid"
          params={{ auctionUuid: auction.uuid }}
          className={styles.secondary}
          onMouseEnter={prefetch}
        >
          Детали
        </Link>
        <Link
          to={auction.primaryAction.to}
          params={{ auctionUuid: auction.uuid }}
          className={styles.primary}
          aria-disabled={auction.primaryAction.disabled || undefined}
          onClick={(event) => {
            if (auction.primaryAction.disabled) event.preventDefault()
          }}
        >
          {auction.primaryAction.label}
        </Link>
      </div>
    </article>
  )
}
