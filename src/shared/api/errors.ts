import type { ProblemDetail, ValidationError, ValidationProblem } from './types'

export type ApiErrorKind =
  | 'unauthorized'
  | 'not_found'
  | 'validation'
  | 'unavailable'
  | 'http'
  | 'network'
  | 'unknown'

type ApiErrorOptions = {
  status: number
  kind: ApiErrorKind
  code?: string
  title?: string
  message: string
  traceId?: string | null
  errors?: ValidationError[]
  cause?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly kind: ApiErrorKind
  readonly code?: string
  readonly title?: string
  readonly traceId?: string | null
  readonly errors?: ValidationError[]

  constructor(options: ApiErrorOptions) {
    super(options.message)
    this.name = 'ApiError'
    this.status = options.status
    this.kind = options.kind
    this.code = options.code
    this.title = options.title
    this.traceId = options.traceId
    this.errors = options.errors
    if (options.cause !== undefined) {
      this.cause = options.cause
    }
  }

  get isUnauthorized() {
    return this.kind === 'unauthorized'
  }

  get isNotFound() {
    return this.kind === 'not_found'
  }

  get isValidation() {
    return this.kind === 'validation'
  }

  get isUnavailable() {
    return this.kind === 'unavailable'
  }
}

function kindFromStatus(status: number): ApiErrorKind {
  switch (status) {
    case 401:
      return 'unauthorized'
    case 404:
      return 'not_found'
    case 422:
      return 'validation'
    case 503:
      return 'unavailable'
    default:
      return 'http'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProblemDetail(value: unknown): value is ProblemDetail {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.title === 'string' &&
    typeof value.message === 'string'
  )
}

function isValidationProblem(value: unknown): value is ValidationProblem {
  return isProblemDetail(value) && Array.isArray((value as ValidationProblem).errors)
}

export async function parseApiError(response: Response): Promise<ApiError> {
  const status = response.status
  const kind = kindFromStatus(status)

  let body: unknown
  try {
    const text = await response.text()
    body = text ? JSON.parse(text) : null
  } catch (cause) {
    return new ApiError({
      status,
      kind,
      message: response.statusText || `HTTP ${status}`,
      cause,
    })
  }

  if (isValidationProblem(body)) {
    return new ApiError({
      status,
      kind: 'validation',
      code: body.code,
      title: body.title,
      message: body.message,
      traceId: body.trace_id,
      errors: body.errors,
    })
  }

  if (isProblemDetail(body)) {
    return new ApiError({
      status,
      kind,
      code: body.code,
      title: body.title,
      message: body.message,
      traceId: body.trace_id,
    })
  }

  return new ApiError({
    status,
    kind,
    message: response.statusText || `HTTP ${status}`,
  })
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
