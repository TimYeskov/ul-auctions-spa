import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div>
      <header
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          background: '#fff',
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <strong>UL Auctions</strong>
        <Link to="/">Список</Link>
      </header>
      <div style={{ padding: '1.25rem' }}>
        <Outlet />
      </div>
    </div>
  )
}
