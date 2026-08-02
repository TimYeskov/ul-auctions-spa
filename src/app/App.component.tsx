import { RouterProvider } from '@tanstack/react-router'
import { QueryProvider } from '@/app/providers/query-provider.component'
import { router } from '@/app/router/router'
import { ToastViewport } from '@/shared/ui/toast'

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <ToastViewport />
    </QueryProvider>
  )
}
