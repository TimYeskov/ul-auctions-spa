import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './root-route.component'
import {
  auctionBetRoute,
  auctionBetsRoute,
  auctionDetailRoute,
  auctionsListRoute,
} from './routes'

const routeTree = rootRoute.addChildren([
  auctionsListRoute,
  auctionDetailRoute,
  auctionBetsRoute,
  auctionBetRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
