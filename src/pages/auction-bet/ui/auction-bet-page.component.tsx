import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { formatPrice } from '@/entities/auction'
import { PlaceBetForm, type BetConstraints } from '@/features/place-bet'
import { isApiError } from '@/shared/api'
import { useToastStore } from '@/shared/ui/toast'
import { useAuctionDetail } from '@/pages/auction-detail/api/use-auction-detail'
import { usePlaceBet } from '../api/use-place-bet'
import styles from './auction-bet-page.module.css'

export function AuctionBetPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })
  const navigate = useNavigate()
  const detailQuery = useAuctionDetail(auctionUuid)
  const placeBet = usePlaceBet(auctionUuid)
  const pushToast = useToastStore((state) => state.push)

  if (detailQuery.isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.skeleton} />
      </main>
    )
  }

  if (detailQuery.isError) {
    const notFound = isApiError(detailQuery.error) && detailQuery.error.isNotFound
    return (
      <main className={styles.page}>
        <div className={styles.state}>
          <h1>{notFound ? 'Аукцион не найден' : 'Ошибка загрузки'}</h1>
          <p>
            {isApiError(detailQuery.error)
              ? detailQuery.error.message
              : 'Не удалось получить данные аукциона.'}
          </p>
          <button type="button" onClick={() => void detailQuery.refetch()}>
            Повторить
          </button>
        </div>
      </main>
    )
  }

  const detail = detailQuery.data
  if (!detail) return null

  const cargoNum = detail.main.cargo_num ?? auctionUuid
  const canSetBet = Boolean(detail.trading.can_set_bet)
  const hasOwnBet = Boolean(detail.trading.your?.bet)
  const price = detail.trading.price

  const constraints: BetConstraints = {
    min: price?.min,
    max: price?.max,
    step: price?.step,
    available: price?.available,
    current: price?.current,
    aucType: detail.main.auc_type,
  }

  const serverFieldErrors =
    placeBet.error && isApiError(placeBet.error) && placeBet.error.isValidation
      ? Object.fromEntries(
          (placeBet.error.errors ?? []).map((error) => [
            error.field,
            error.message,
          ]),
        )
      : undefined

  const serverError =
    placeBet.error && isApiError(placeBet.error)
      ? placeBet.error.message
      : placeBet.error
        ? 'Не удалось отправить ставку'
        : null

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Аукцион № {cargoNum}</p>
          <h1 className={styles.title}>
            {hasOwnBet ? 'Изменить ставку' : 'Сделать ставку'}
          </h1>
          <p className={styles.subtitle}>
            Укажите цену с учётом доступного значения и шага торгов
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
          <Link
            to="/auctions/$auctionUuid/bets"
            params={{ auctionUuid }}
            className={styles.secondary}
          >
            Ставки
          </Link>
        </div>
      </header>

      {!canSetBet ? (
        <div className={styles.state}>
          <h2>Ставка недоступна</h2>
          <p>Для этого аукциона сейчас нельзя установить или изменить ставку.</p>
        </div>
      ) : (
        <PlaceBetForm
          constraints={constraints}
          hint={{
            availableLabel: formatPrice(price?.available),
            stepLabel: formatPrice(price?.step),
            minLabel: formatPrice(price?.min),
            maxLabel: formatPrice(price?.max),
            currentLabel: formatPrice(price?.current),
          }}
          isSubmitting={placeBet.isPending}
          serverError={serverError}
          fieldErrors={serverFieldErrors}
          onSubmit={async (values) => {
            try {
              await placeBet.mutateAsync({ price: values.price })
              pushToast({
                kind: 'success',
                title: 'Ставка принята',
                message: `Отправлена цена ${formatPrice(values.price)}`,
              })
              void navigate({
                to: '/auctions/$auctionUuid',
                params: { auctionUuid },
              })
            } catch (error) {
              const message = isApiError(error)
                ? error.message
                : 'Не удалось отправить ставку'
              pushToast({
                kind: 'error',
                title: 'Ошибка ставки',
                message,
              })
            }
          }}
        />
      )}
    </main>
  )
}
