import { RouterProvider } from '@tanstack/react-router'
import { QueryProvider } from '@/app/providers/query-provider.component'
import { router } from '@/app/router/router'

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  )
}
