# AI Usage

Документ описывает, как AI использовался при выполнении тестового задания UL Auctions SPA.

## Какие части делались с AI

- Разбор PDF и `openapi.auctions.v0.json`, составление поэтапного плана работ.
- Scaffold проекта (Vite + React + TS, FSD-скелет, роуты-заглушки, MSW worker).
- Генерация TypeScript-типов из OpenAPI и каркас API-клиента / `ApiError`.
- Реализация MSW handlers и мутабельного in-memory store (seed, фильтры, `setBet`).
- UI страниц: список + фильтры, деталка, ставки, форма ставки.
- Unit-тесты на чистую логику (search params, мапперы, Zod-схема ставки, store).
- Инкрементальные git-коммиты и публикация в GitHub.

Работа шла в Cursor Agent: AI писал код, запускал `build`/`test`, правил ошибки типов и пушил этапы отдельными коммитами.

## Какие решения приняты самостоятельно (кандидатом / в диалоге)

- **Инкрементальная сдача в GitHub**, а не один финальный коммит.
- **Zustand только для toast**, серверные данные — строго в TanStack Query.
- **URL search params** для фильтров списка (не localStorage).
- **Типы из OpenAPI** через `openapi-typescript`, поверх — тонкие aliases и клиент.
- **Единый MSW store** как source of truth для list/detail/bets после мутаций.
- **Свои CSS modules** без UI-kit, чтобы быстрее закрыть сценарии ТЗ.
- Именование компонентов строго `*.component.tsx` по требованию задания.

## Какие AI-предложения были отклонены / скорректированы

- Не раздувать scope за рамки OpenAPI и PDF (без лишних сущностей и «улучшений продукта»).
- Не тащить тяжёлую UI-библиотеку «по умолчанию».
- Не класть серверный стейт в MobX/Zustand.
- Исправление хрупких мест после AI-черновиков:
  - типы `null` vs `undefined` в seed под generated OpenAPI types;
  - корректный merge overrides в тестовых фикстурах;
  - совместимость Zod 4 + `zodResolver` (явный `Resolver<BetFormValues>`);
  - search params у `Link to="/"` после появления `validateSearch`.

## Что проверялось особенно внимательно

- Соответствие request/response контрактам OpenAPI (enum’ы, nullable, `ProblemDetail` / `422`).
- Мутация ставки: обновление `current` / `available` / `your` / `status_mobile` / bets.
- Флаги `can_set_bet`, `hide_bets_history`, `hide_points_address_and_contacts`, `no_view_cargo_price`.
- Zod-валидация search params со safe fallback.
- Инвалидация Query-ключей после `setBet`.
- `npm run test` и `npm run build` на каждом крупном этапе.

## Какие риски остались

- MSW-фильтрация покрывает нужные фильтры ТЗ, но не гарантирует 1:1 поведение реального backend по всем полям `AuctionListRequest`.
- Нет e2e-регрессии на пользовательские сценарии в CI.
- Визуальный дизайн минимальный: удобен для проверки логики, но не «продуктовый» UI-kit.
- Production-сборка не поднимает MSW — без отдельного mock-режима/прокси API приложение не получит данные.
- Точность step-валидации на float может давать краевые кейсы (как и в реальных деньгах без decimal-библиотеки).

## Что улучшить при наличии ещё одного дня

1. Playwright-сценарии: список → фильтр → деталка → ставка → история.
2. Вынести session/current user из MSW constants в `shared/config`.
3. Более строгий decimal/money helper для step/min/max.
4. Добить UI-фильтры до полного `AuctionListRequest` или явно задокументировать subset.
5. Storybook/витрина seed-сценариев для ревьюера.
6. CI (GitHub Actions): `lint` + `test` + `build` на PR.
7. Аккуратнее разложить крупные секции деталки в `widgets/` по FSD.
