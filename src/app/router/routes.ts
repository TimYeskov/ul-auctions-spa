import { createRoute } from '@tanstack/react-router'
import { AuctionBetPage } from '@/pages/auction-bet/ui/auction-bet-page.component'
import { AuctionBetsPage } from '@/pages/auction-bets/ui/auction-bets-page.component'
import { AuctionDetailPage } from '@/pages/auction-detail/ui/auction-detail-page.component'
import { AuctionsListPage } from '@/pages/auctions-list/ui/auctions-list-page.component'
import { parseAuctionsSearch } from '@/features/auctions-filters'
import { parseAuctionBetsSearch } from '@/pages/auction-bets/model/search-schema'
import { rootRoute } from './root-route.component'

export const auctionsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search) => parseAuctionsSearch(search),
  component: AuctionsListPage,
})

export const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionUuid',
  component: AuctionDetailPage,
})

export const auctionBetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionUuid/bets',
  validateSearch: (search) => parseAuctionBetsSearch(search),
  component: AuctionBetsPage,
})

export const auctionBetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionUuid/bet',
  component: AuctionBetPage,
})
