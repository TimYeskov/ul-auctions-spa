# UL Auctions SPA

Тестовое задание: SPA для работы с грузовыми аукционами по OpenAPI-схеме `openapi.auctions.v0.json`.

Репозиторий: https://github.com/TimYeskov/ul-auctions-spa

## Стек

- React + TypeScript + Vite
- TanStack Router / TanStack Query
- React Hook Form + Zod
- MSW (мутабельный in-memory store)
- Feature-Sliced Design
- Zustand (toast UI-state)
- Vitest

## Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173/

В dev-режиме автоматически стартует MSW (`public/mockServiceWorker.js`). Backend не нужен.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | локальная разработка + MSW |
| `npm run build` | production-сборка (`tsc -b && vite build`) |
| `npm run preview` | просмотр production-сборки |
| `npm run test` | unit-тесты (Vitest) |
| `npm run lint` | oxlint |
| `npm run generate:api` | перегенерация типов из OpenAPI |

## Маршруты

| Путь | Назначение |
|------|------------|
| `/` | список аукционов, фильтры в URL search params |
| `/auctions/$auctionUuid` | деталка |
| `/auctions/$auctionUuid/bets` | история ставок (`?all=true` — включая отменённые) |
| `/auctions/$auctionUuid/bet` | форма ставки (открывается по прямой ссылке) |

## Структура (FSD)

```
src/
  app/        # провайдеры, роутер, глобальные стили
  pages/      # страницы маршрутов
  widgets/    # составные блоки (зарезервировано)
  features/   # фильтры, пагинация, форма ставки
  entities/   # auction: карточки, мапперы, секции
  shared/     # api-клиент, MSW, toast, config
```

React-компоненты именуются с суффиксом `*.component.tsx`.

## API и моки

Контракт: [`openapi.auctions.v0.json`](./openapi.auctions.v0.json).

Типы: `src/shared/api/generated/openapi.ts`  
Клиент: `auctionsApi` — `list` / `getById` / `listBets` / `setBet`  
Ошибки: `ApiError` для `401` / `404` / `422` / `503` (+ `ProblemDetail` / `ValidationProblem`).

MSW store содержит 8 аукционов:

| UUID (кратко) | Сценарий |
|---------------|----------|
| `3a05d045-…` | Down, можно ставить, есть конкуренты + отменённая ставка |
| `7c9e6679-…` | уже есть своя ставка (`Leading`) |
| `33333333-…` | `can_set_bet=false` |
| `22222222-…` | `hide_bets_history` + скрытые адреса/контакты |
| `44444444-…` | Finished, победитель |
| `55555555-…` | FixPrice |
| `66666666-…` | Up, ставок ещё нет |
| `11111111-…` | Request / Planning |

Словарь городов: `src/shared/api/msw/store/cities.ts`.

После `POST .../bets` store обновляет текущую цену, `available`, `your.*`, `status_mobile` и список ставок.

## Что проверялось

### Автоматически

```bash
npm run test   # 26 тестов
npm run build  # проходит
```

Покрыта чистая логика:

- разбор `ProblemDetail` / `ValidationProblem`
- filter/pagination MSW store + `setBet`
- parsing search params списка
- ViewModel-мапперы list / detail / bets
- Zod-схема ставки (min/max/step/available/FixPrice)

### Вручную в браузере

1. Список грузится, видны skeleton → карточки, пагинация работает.
2. Фильтры пишутся в URL (`cargo_num`, города, даты, цена, тип, статусы, `is_available`, `is_bidder`) и переживают refresh.
3. Hover по карточке префетчит деталку (Network / React Query Devtools не обязательны — повторный переход быстрее).
4. Деталка показывает торги, организатора, маршрут, груз, оплату.
5. Аукцион со скрытыми адресами (`22222222-…`) не показывает контакты/адреса точек.
6. Страница ставок: участники, НДС/без НДС, место, win/own/cancel; `?all=true` показывает отменённые.
7. При `hide_bets_history` — отдельное сообщение, не пустой список «как будто ставок нет».
8. Форма ставки: валидация на клиенте, успех → toast + редирект на деталку, цена/статус обновляются.
9. Аукцион с `can_set_bet=false` блокирует форму.
10. Адаптив: узкая ширина (~375px) — фильтры/карточки/кнопки не ломают layout.

## Ограничения

- Нет реального backend/auth: MSW только в `import.meta.env.DEV`.
- Нет e2e (Playwright/Cypress) — проверка ручная + unit-тесты.
- UI без сторонней component library: собственный лёгкий CSS.
- Не все поля `AuctionListRequest` вынесены в UI-фильтры (в store фильтрация шире, чем форма).
- Toast-очередь на Zustand без persistence.
- `widgets/` слой почти пустой: крупные блоки пока живут в `entities` / `pages`.

## Документация по AI

См. [`AI_USAGE.md`](./AI_USAGE.md).
