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
      data-testid="auction-card"
      data-auction-uuid={auction.uuid}
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
          {auction.isAvailable ? (
            <span className={styles.badgeAccent}>Доступен</span>
          ) : null}
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
        <div className={styles.ownBet}>
          <dt>Моя ставка</dt>
          <dd>{auction.ownBetLabel}</dd>
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
        {auction.primaryAction.disabled ? (
          <span className={styles.disabled} aria-disabled="true">
            {auction.primaryAction.label}
          </span>
        ) : (
          <Link
            to={auction.primaryAction.to}
            params={{ auctionUuid: auction.uuid }}
            className={styles.primary}
            data-testid="auction-primary-action"
          >
            {auction.primaryAction.label}
          </Link>
        )}
      </div>
    </article>
  )
}
