import type { BetListItemViewModel, BetListViewModel } from '../model/map-bets'
import styles from './auction-bets-list.module.css'

type AuctionBetsListProps = {
  list: BetListViewModel
  hidePlaces?: boolean
}

export function AuctionBetsSummary({ list }: { list: BetListViewModel }) {
  return (
    <div className={styles.summary}>
      <div>
        <span className={styles.summaryLabel}>Ставок</span>
        <strong>{list.totalCount}</strong>
      </div>
      <div>
        <span className={styles.summaryLabel}>Участников</span>
        <strong>{list.participantsCount}</strong>
      </div>
      <div>
        <span className={styles.summaryLabel}>Победителей</span>
        <strong>{list.winnersCount}</strong>
      </div>
      <div>
        <span className={styles.summaryLabel}>Отменено / отклонено</span>
        <strong>{list.cancelledCount}</strong>
      </div>
    </div>
  )
}

export function AuctionBetsList({ list, hidePlaces = false }: AuctionBetsListProps) {
  if (list.items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Ставок пока нет</h2>
        <p>Как только появятся предложения, они отобразятся здесь.</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {list.items.map((bet) => (
        <BetCard key={bet.id} bet={bet} hidePlaces={hidePlaces} />
      ))}
    </div>
  )
}

function BetCard({
  bet,
  hidePlaces,
}: {
  bet: BetListItemViewModel
  hidePlaces: boolean
}) {
  return (
    <article
      className={`${styles.card} ${bet.isOwn ? styles.own : ''} ${
        bet.isCancelled || bet.isRejected ? styles.mutedCard : ''
      }`}
    >
      <div className={styles.top}>
        <div>
          <h3 className={styles.org}>{bet.organizationName}</h3>
          <p className={styles.meta}>
            ИНН {bet.organizationInn} · {bet.contactLabel}
          </p>
        </div>
        <div className={styles.badges}>
          {!hidePlaces ? (
            <span className={styles.badge}>Место {bet.placeLabel}</span>
          ) : null}
          {bet.isWin ? <span className={styles.badgeWin}>Победа</span> : null}
          {bet.isOwn ? <span className={styles.badgeOwn}>Моя</span> : null}
          {bet.isCounter ? <span className={styles.badge}>Встречная</span> : null}
          {bet.isRejected ? (
            <span className={styles.badgeDanger}>Отклонена</span>
          ) : null}
          {bet.isCancelled ? (
            <span className={styles.badgeDanger}>Отменена</span>
          ) : null}
        </div>
      </div>

      <dl className={styles.prices}>
        <div>
          <dt>С НДС</dt>
          <dd>{bet.priceWithVatLabel}</dd>
        </div>
        <div>
          <dt>Без НДС</dt>
          <dd>{bet.priceNoVatLabel}</dd>
        </div>
        <div>
          <dt>Дата</dt>
          <dd>{bet.createdAtLabel}</dd>
        </div>
      </dl>

      {bet.cancelReason ? (
        <p className={styles.reason}>Причина: {bet.cancelReason}</p>
      ) : null}
      {bet.comment ? <p className={styles.comment}>{bet.comment}</p> : null}
    </article>
  )
}
