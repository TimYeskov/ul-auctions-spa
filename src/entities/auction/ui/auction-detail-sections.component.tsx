import { Link } from '@tanstack/react-router'
import type { AuctionDetailViewModel } from '../model/map-detail'
import styles from './auction-detail-sections.module.css'

type SectionProps = {
  auction: AuctionDetailViewModel
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function AuctionDetailHeader({ auction }: SectionProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.headerTop}>
        <div>
          <p className={styles.eyebrow}>{auction.aucTypeLabel}</p>
          <h1 className={styles.title}>№ {auction.cargoNum}</h1>
          <p className={styles.subtitle}>{auction.tradingPeriodLabel}</p>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>{auction.statusLabel}</span>
          <span
            className={
              auction.trading.hasOwnBet ? styles.badgeAccent : styles.badgeMuted
            }
          >
            {auction.statusMobileLabel}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <Link
          to="/"
          search={{ page: 1, per_page: 10 }}
          className={styles.secondary}
        >
          К списку
        </Link>
        {auction.secondaryBetsAction?.to ? (
          <Link
            to={auction.secondaryBetsAction.to}
            params={{ auctionUuid: auction.uuid }}
            className={styles.secondary}
          >
            {auction.secondaryBetsAction.label}
          </Link>
        ) : null}
        {auction.primaryAction.to ? (
          <Link
            to={auction.primaryAction.to}
            params={{ auctionUuid: auction.uuid }}
            className={styles.primary}
          >
            {auction.primaryAction.label}
          </Link>
        ) : (
          <span className={styles.disabled}>{auction.primaryAction.label}</span>
        )}
      </div>
    </section>
  )
}

export function AuctionDetailTrading({ auction }: SectionProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.sectionTitle}>Торги</h2>
      <dl className={styles.grid}>
        <Row label="Текущая цена" value={auction.trading.currentLabel} />
        <Row label="Без НДС" value={auction.trading.currentNoVatLabel} />
        <Row label="Доступно" value={auction.trading.availableLabel} />
        <Row label="Стартовая" value={auction.trading.startLabel} />
        <Row label="Min" value={auction.trading.minLabel} />
        <Row label="Max" value={auction.trading.maxLabel} />
        <Row label="Шаг" value={auction.trading.stepLabel} />
        <Row label="₽/км" value={auction.trading.pricePerKmLabel} />
        <Row label="Ед. измерения" value={auction.bidMeasurementLabel} />
        <Row label="Моя ставка" value={auction.trading.yourBetLabel} />
        <Row
          label="Можно ставить"
          value={auction.trading.canSetBet ? 'Да' : 'Нет'}
        />
        <Row
          label="Победитель"
          value={auction.trading.isWinner ? 'Да' : 'Нет'}
        />
      </dl>
    </section>
  )
}

export function AuctionDetailOrganizer({ auction }: SectionProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.sectionTitle}>Организатор</h2>
      <dl className={styles.grid}>
        <Row label="Название" value={auction.organizer.name} />
        <Row label="ИНН" value={auction.organizer.inn} />
        <Row label="КПП" value={auction.organizer.kpp} />
        <Row label="Создан" value={auction.createdAtLabel} />
      </dl>

      {auction.showContacts ? (
        <div className={styles.contacts}>
          <h3 className={styles.subTitle}>Контакты</h3>
          <ul className={styles.list}>
            {auction.contacts.map((contact) => (
              <li key={`${contact.name}-${contact.phone}`}>
                <strong>{contact.name}</strong>
                <span>
                  {contact.phone} · {contact.email}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.note}>Контакты скрыты условиями торгов.</p>
      )}
    </section>
  )
}

export function AuctionDetailCargo({ auction }: SectionProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.sectionTitle}>Груз и ТС</h2>
      <dl className={styles.grid}>
        <Row label="Кузов" value={auction.cargo.bodyType} />
        <Row label="Дистанция" value={auction.cargo.distanceLabel} />
        <Row label="Машин" value={auction.cargo.truckCountLabel} />
        <Row label="Температура" value={auction.cargo.temperatureLabel} />
        <Row label="Требования к ТС" value={auction.cargo.carLabel} />
        {auction.cargo.cargoPriceLabel != null ? (
          <Row label="Цена груза" value={auction.cargo.cargoPriceLabel} />
        ) : (
          <Row label="Цена груза" value="Скрыта" />
        )}
      </dl>
      <div className={styles.tagsBlock}>
        <TagList title="Погрузка" values={auction.cargo.loadingTypes} />
        <TagList title="Документы" values={auction.cargo.docs} />
        <TagList title="Опции" values={auction.cargo.requirements} />
      </div>
    </section>
  )
}

export function AuctionDetailRoutes({ auction }: SectionProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.sectionTitle}>Маршрут</h2>
      <div className={styles.routeList}>
        {auction.routes.map((point) => (
          <article key={point.key} className={styles.routeCard}>
            <h3 className={styles.subTitle}>{point.title}</h3>
            <p className={styles.routeCity}>{point.city}</p>
            <p className={styles.muted}>{point.periodLabel}</p>
            {point.address ? <p>Адрес: {point.address}</p> : null}
            {point.contact ? <p>Контакт: {point.contact}</p> : null}
            {auction.hidePointsAddressAndContacts ? (
              <p className={styles.note}>Адрес и контакт точки скрыты.</p>
            ) : null}
            <p>
              {point.cargoName}
              <span className={styles.muted}> · {point.weightVolume}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function AuctionDetailPayment({ auction }: SectionProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.sectionTitle}>Оплата</h2>
      <dl className={styles.grid}>
        <Row label="Форма" value={auction.payment.form} />
        <Row label="Условие" value={auction.payment.condition} />
        <Row label="Отсрочка" value={auction.payment.delayLabel} />
        <Row label="Предоплата" value={auction.payment.prepay} />
      </dl>
      {auction.hideBetsHistory ? (
        <p className={styles.note}>История ставок скрыта для этого аукциона.</p>
      ) : null}
    </section>
  )
}

function TagList({ title, values }: { title: string; values: string[] }) {
  if (values.length === 0) return null
  return (
    <div>
      <h3 className={styles.subTitle}>{title}</h3>
      <div className={styles.tags}>
        {values.map((value) => (
          <span key={value} className={styles.tag}>
            {value}
          </span>
        ))}
      </div>
    </div>
  )
}
