import { useToastStore } from './toast-store'
import styles from './toast-viewport.module.css'

export function ToastViewport() {
  const items = useToastStore((state) => state.items)
  const dismiss = useToastStore((state) => state.dismiss)

  if (items.length === 0) return null

  return (
    <div className={styles.viewport} aria-live="polite">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${
            toast.kind === 'success' ? styles.success : styles.error
          }`}
          role="status"
        >
          <div>
            <strong>{toast.title}</strong>
            {toast.message ? <p>{toast.message}</p> : null}
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => dismiss(toast.id)}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
