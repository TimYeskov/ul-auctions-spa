import { describe, expect, it } from 'vitest'
import { ApiError, parseApiError } from './errors'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('parseApiError', () => {
  it('maps 404 ProblemDetail', async () => {
    const error = await parseApiError(
      jsonResponse(404, {
        code: 'resource_not_found',
        title: 'Не найдено',
        message: 'Заявка не найдена',
        trace_id: 'trace-1',
      }),
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error.kind).toBe('not_found')
    expect(error.code).toBe('resource_not_found')
    expect(error.traceId).toBe('trace-1')
  })

  it('maps 422 ValidationProblem with field errors', async () => {
    const error = await parseApiError(
      jsonResponse(422, {
        code: 'validation_failed',
        title: 'Ошибка валидации',
        message: 'Запрос содержит некорректные поля.',
        errors: [{ field: 'price', message: 'Значение должно быть больше 0.' }],
      }),
    )

    expect(error.kind).toBe('validation')
    expect(error.errors).toEqual([
      { field: 'price', message: 'Значение должно быть больше 0.' },
    ])
  })

  it('maps 401 and 503 kinds', async () => {
    const unauthorized = await parseApiError(
      jsonResponse(401, {
        code: 'unauthorized',
        title: 'Unauthorized',
        message: 'Нет доступа',
      }),
    )
    const unavailable = await parseApiError(
      jsonResponse(503, {
        code: 'service_unavailable',
        title: 'Unavailable',
        message: 'Сервис недоступен',
      }),
    )

    expect(unauthorized.kind).toBe('unauthorized')
    expect(unavailable.kind).toBe('unavailable')
  })
})
