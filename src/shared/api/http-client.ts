import { API_BASE_URL } from '@/shared/config/env'
import { ApiError, parseApiError } from './errors'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | null | undefined>
  signal?: AbortSignal
  headers?: HeadersInit
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  const url = new URL(`${API_BASE_URL}/${normalizedPath}`, window.location.origin)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }

  return `${url.pathname}${url.search}`
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, query, signal, headers } = options

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (!response.ok) {
      throw await parseApiError(response)
    }

    if (response.status === 204) {
      return undefined as T
    }

    const text = await response.text()
    if (!text) {
      return undefined as T
    }

    return JSON.parse(text) as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError({
      status: 0,
      kind: 'network',
      message: error instanceof Error ? error.message : 'Network request failed',
      cause: error,
    })
  }
}
