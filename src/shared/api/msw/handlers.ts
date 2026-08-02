import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/shared/config/env'
import type { AuctionListRequest, SetBetRequest } from '@/shared/api/types'
import { auctionsStore } from './store/auctions-store'

const base = API_BASE_URL

function problem(
  status: number,
  code: string,
  title: string,
  message: string,
) {
  return HttpResponse.json(
    {
      code,
      title,
      message,
      trace_id: crypto.randomUUID().replaceAll('-', ''),
    },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

function validationFailed(errors: { field: string; message: string; code?: string | null }[]) {
  return HttpResponse.json(
    {
      code: 'validation_failed',
      title: 'Ошибка валидации',
      message: 'Запрос содержит некорректные поля.',
      trace_id: crypto.randomUUID().replaceAll('-', ''),
      errors,
    },
    { status: 422, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

export const handlers = [
  http.post(`${base}/auctions/list`, async ({ request }) => {
    let body: AuctionListRequest = {}
    try {
      const text = await request.text()
      body = text ? (JSON.parse(text) as AuctionListRequest) : {}
    } catch {
      return validationFailed([
        {
          field: 'body',
          message: 'Тело запроса должно быть валидным JSON.',
          code: 'invalid_json',
        },
      ])
    }

    if (body.per_page != null && body.per_page > 100) {
      return validationFailed([
        {
          field: 'per_page',
          message: 'Значение должно быть не больше 100.',
          code: 'max_value',
        },
      ])
    }

    return HttpResponse.json(auctionsStore.list(body))
  }),

  http.get(`${base}/auctions/:auctionUuid`, ({ params }) => {
    const auctionUuid = String(params.auctionUuid)
    const record = auctionsStore.getByUuid(auctionUuid)

    if (!record) {
      return problem(404, 'resource_not_found', 'Не найдено', 'Аукцион не найден')
    }

    return HttpResponse.json(record.detail)
  }),

  http.get(`${base}/auctions/:auctionUuid/bets`, ({ params, request }) => {
    const auctionUuid = String(params.auctionUuid)
    const url = new URL(request.url)
    const allParam = url.searchParams.get('all')
    const all =
      allParam === null ? false : allParam === 'true' || allParam === '1'

    const result = auctionsStore.listBets(auctionUuid, all)
    if (!result) {
      return problem(404, 'resource_not_found', 'Не найдено', 'Аукцион не найден')
    }

    return HttpResponse.json(result)
  }),

  http.post(`${base}/auctions/:auctionUuid/bets`, async ({ params, request }) => {
    const auctionUuid = String(params.auctionUuid)

    let body: SetBetRequest
    try {
      body = (await request.json()) as SetBetRequest
    } catch {
      return validationFailed([
        {
          field: 'body',
          message: 'Тело запроса должно быть валидным JSON.',
          code: 'invalid_json',
        },
      ])
    }

    const result = auctionsStore.setBet(auctionUuid, body)

    if (!result.ok && result.status === 404) {
      return problem(404, 'resource_not_found', 'Не найдено', 'Аукцион не найден')
    }

    if (!result.ok && result.status === 422) {
      return validationFailed(result.errors)
    }

    return new HttpResponse(null, { status: 200 })
  }),
]
