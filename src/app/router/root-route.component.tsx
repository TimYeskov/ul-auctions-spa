import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import styles from './root-route.module.css'

export const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" search={{ page: 1, per_page: 10 }} className={styles.brand}>
          UL Auctions
        </Link>
        <nav className={styles.nav}>
          <Link to="/" search={{ page: 1, per_page: 10 }} className={styles.navLink}>
            Список
          </Link>
        </nav>
      </header>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}
