# AI Usage

This document describes how AI was used while completing the UL Auctions SPA take-home assignment.

## What was done with AI

- Analysis of the PDF brief and `openapi.auctions.v0.json`, drafting a step-by-step work plan.
- Project scaffold (Vite + React + TS, FSD skeleton, stub routes, MSW worker).
- Generating TypeScript types from OpenAPI and the API client / `ApiError` skeleton.
- MSW handlers and a mutable in-memory store (seed, filters, `setBet`).
- Page UI: list + filters, details, bids, bid form.
- Unit tests for pure logic (search params, mappers, Zod bid schema, store).
- Incremental git commits and publishing to GitHub.

The work was done in Cursor Agent: the AI wrote code, ran `build`/`test`, fixed type errors and pushed each stage as a separate commit.

## Decisions made independently (by the candidate / in discussion)

- **Incremental delivery to GitHub** instead of a single final commit.
- **Zustand only for toasts**; server data lives strictly in TanStack Query.
- **URL search params** for list filters (not localStorage).
- **Types generated from OpenAPI** via `openapi-typescript`, with thin aliases and a client on top.
- **A single MSW store** as the source of truth for list/detail/bets after mutations.
- **Custom CSS modules** without a UI kit, to cover the brief's scenarios faster.
- Components strictly named `*.component.tsx`, as required by the assignment.

## AI suggestions rejected or corrected

- Do not grow the scope beyond the OpenAPI schema and the PDF (no extra entities or "product improvements").
- Do not pull in a heavy UI library "by default".
- Do not keep server state in MobX/Zustand.
- Fixing fragile spots in AI drafts:
  - `null` vs `undefined` types in the seed to match the generated OpenAPI types;
  - correct merging of overrides in test fixtures;
  - Zod 4 + `zodResolver` compatibility (explicit `Resolver<BetFormValues>`);
  - search params on `Link to="/"` after `validateSearch` was introduced.

## What was checked especially carefully

- Conformance to the OpenAPI request/response contracts (enums, nullable fields, `ProblemDetail` / `422`).
- The bid mutation: updating `current` / `available` / `your` / `status_mobile` / bets.
- Flags `can_set_bet`, `hide_bets_history`, `hide_points_address_and_contacts`, `no_view_cargo_price`.
- Zod validation of search params with a safe fallback.
- Query key invalidation after `setBet`.
- `npm run test` and `npm run build` at every major stage.

## Remaining risks

- MSW filtering covers the filters required by the brief but does not guarantee 1:1 behaviour with a real backend for every `AuctionListRequest` field.
- No e2e regression of user scenarios in CI.
- Minimal visual design: convenient for verifying logic, but not a production-grade UI kit.
- The production build does not start MSW — without a separate mock mode/API proxy the app gets no data.
- Float-based step validation may produce edge cases (as with real money without a decimal library).

## What I would improve with one more day

1. Playwright scenarios: list → filter → details → bid → history.
2. Move the session/current user from MSW constants to `shared/config`.
3. A stricter decimal/money helper for step/min/max.
4. Extend UI filters to the full `AuctionListRequest` or explicitly document the subset.
5. Storybook / a showcase of seed scenarios for the reviewer.
6. CI (GitHub Actions): `lint` + `test` + `build` on PRs.
7. Split large detail-page sections into `widgets/` per FSD.
