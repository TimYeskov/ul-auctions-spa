import { useParams } from '@tanstack/react-router'

export function AuctionBetsPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bets' })

  return (
    <main>
      <h1>Ставки</h1>
      <p>UUID: {auctionUuid}</p>
    </main>
  )
}
