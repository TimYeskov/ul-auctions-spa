import { useParams } from '@tanstack/react-router'

export function AuctionDetailPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid' })

  return (
    <main>
      <h1>Аукцион</h1>
      <p>UUID: {auctionUuid}</p>
    </main>
  )
}
