import { useParams } from '@tanstack/react-router'

export function AuctionBetPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })

  return (
    <main>
      <h1>Сделать ставку</h1>
      <p>UUID: {auctionUuid}</p>
    </main>
  )
}
