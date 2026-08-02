import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App.component'
import '@/app/styles/index.css'

async function enableMocking() {
  if (import.meta.env.PROD) {
    return
  }

  const { worker } = await import('@/shared/api/msw/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
