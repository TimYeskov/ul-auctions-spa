# UL Auctions SPA

Take-home assignment: an SPA for freight auctions built against the OpenAPI schema `openapi.auctions.v0.json`.

Repository: https://github.com/TimYeskov/ul-auctions-spa

## Stack

- React + TypeScript + Vite
- TanStack Router / TanStack Query
- React Hook Form + Zod
- MSW (mutable in-memory store)
- Feature-Sliced Design
- Zustand (toast UI state)
- Vitest

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173/

In dev mode MSW starts automatically (`public/mockServiceWorker.js`). No backend required.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | local development + MSW |
| `npm run build` | production build (`tsc -b && vite build`) |
| `npm run preview` | preview the production build |
| `npm run test` | unit tests (Vitest) |
| `npm run test:e2e` | smoke e2e (Playwright) |
| `npm run lint` | oxlint |
| `npm run generate:api` | regenerate types from OpenAPI |

## Routes

| Path | Purpose |
|------|---------|
| `/` | auction list, filters stored in URL search params |
| `/auctions/$auctionUuid` | auction details |
| `/auctions/$auctionUuid/bets` | bid history (`?all=true` includes cancelled bids) |
| `/auctions/$auctionUuid/bet` | bid form (opens via direct link) |

## Structure (FSD)

```
src/
  app/        # providers, router, global styles
  pages/      # route pages
  widgets/    # composite blocks (reserved)
  features/   # filters, pagination, bid form
  entities/   # auction: cards, mappers, sections
  shared/     # API client, MSW, toast, config
```

React components use the `*.component.tsx` suffix.

## API and mocks

Contract: [`openapi.auctions.v0.json`](./openapi.auctions.v0.json).

Types: `src/shared/api/generated/openapi.ts`  
Client: `auctionsApi` — `list` / `getById` / `listBets` / `setBet`  
Errors: `ApiError` for `401` / `404` / `422` / `503` (+ `ProblemDetail` / `ValidationProblem`).

The MSW store contains 8 auctions:

| UUID (short) | Scenario |
|--------------|----------|
| `3a05d045-…` | Down auction, bidding open, competitors + a cancelled bid |
| `7c9e6679-…` | own bid already placed (`Leading`) |
| `33333333-…` | `can_set_bet=false` |
| `22222222-…` | `hide_bets_history` + hidden addresses/contacts |
| `44444444-…` | Finished, with a winner |
| `55555555-…` | FixPrice |
| `66666666-…` | Up auction, no bids yet |
| `11111111-…` | Request / Planning |

City dictionary: `src/shared/api/msw/store/cities.ts`.

After `POST .../bets` the store updates the current price, `available`, `your.*`, `status_mobile` and the bid list.

## Testing

### Automated

```bash
npm run test      # 27+ unit tests
npm run test:e2e  # smoke: list, filter, bid, hide_bets_history
npm run build
```

Pure logic covered by tests:

- parsing `ProblemDetail` / `ValidationProblem`
- MSW store filtering/pagination + `setBet`
- parsing list search params
- ViewModel mappers for list / detail / bets
- Zod bid schema (min/max/step/available/FixPrice)

### Manual, in the browser

1. The list loads with skeleton → cards; pagination works.
2. Filters are written to the URL (`cargo_num`, cities, dates, price, type, statuses, `is_available`, `is_bidder`) and survive a refresh.
3. Hovering a card prefetches its details (the second navigation is noticeably faster).
4. The details page shows bidding info, organizer, route, cargo and payment.
5. An auction with hidden addresses (`22222222-…`) does not reveal contacts/route addresses.
6. Bids page: participants, VAT / no VAT, rank, win/own/cancel; `?all=true` shows cancelled bids.
7. With `hide_bets_history` a dedicated message is shown instead of an empty "no bids" list.
8. Bid form: client-side validation; success → toast + redirect to details, price/status update.
9. An auction with `can_set_bet=false` disables the form.
10. Responsive: at narrow width (~375px) filters, cards and buttons keep the layout intact.

## Limitations

- No real backend/auth: MSW runs only in `import.meta.env.DEV`.
- No full e2e suite — only a Playwright smoke test (`npm run test:e2e`), no CI browser matrix.
- No third-party component library: lightweight custom CSS.
- Not all `AuctionListRequest` fields are exposed as UI filters (the store filters more than the form).
- Zustand toast queue without persistence.
- The `widgets/` layer is almost empty: large blocks currently live in `entities` / `pages`.

## AI usage

See [`AI_USAGE.md`](./AI_USAGE.md).
