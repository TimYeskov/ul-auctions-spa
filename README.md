# UL Auctions SPA

Тестовое задание: SPA для работы с грузовыми аукционами по OpenAPI-схеме.

## Стек

- React + TypeScript + Vite
- TanStack Router / TanStack Query
- React Hook Form + Zod
- MSW
- Feature-Sliced Design
- Zustand (клиентский UI-state)

## Запуск

```bash
npm install
npm run dev
```

В dev-режиме поднимается MSW (`public/mockServiceWorker.js`).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | локальная разработка |
| `npm run build` | production-сборка |
| `npm run test` | unit-тесты (Vitest) |
| `npm run lint` | oxlint |

## Маршруты

- `/` — список аукционов
- `/auctions/$auctionUuid` — деталка
- `/auctions/$auctionUuid/bets` — ставки
- `/auctions/$auctionUuid/bet` — форма ставки

## Структура (FSD)

```
src/
  app/        # провайдеры, роутер, стили
  pages/      # страницы маршрутов
  widgets/    # составные блоки
  features/   # пользовательские сценарии
  entities/   # бизнес-сущности
  shared/     # api, config, ui-kit
```

Компоненты именуются с суффиксом `*.component.tsx`.

## API

Контракт: `openapi.auctions.v0.json`.

Типы генерируются в `src/shared/api/generated/openapi.ts`:

```bash
npm run generate:api
```

Клиент: `auctionsApi` (`list`, `getById`, `listBets`, `setBet`) с разбором ошибок `401` / `404` / `422` / `503`.
