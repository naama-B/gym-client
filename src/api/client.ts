import type { ApiErrorBody } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** Thrown for any non-2xx API response. Carries the parsed error body when present. */
export class ApiError extends Error {
  readonly status: number
  readonly body?: ApiErrorBody
  readonly correlationId?: string | null

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    this.correlationId = body?.correlationId ?? null
  }

  get isConflict(): boolean {
    return this.status === 409
  }
  get isUnauthorized(): boolean {
    return this.status === 401
  }
  get isForbidden(): boolean {
    return this.status === 403
  }
}

let authToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

/** Registered by AuthProvider so a 401 anywhere drops the stored session. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

function messageFromBody(status: number, body: ApiErrorBody | undefined): string {
  if (!body) return `Request failed (${status})`
  if (body.errors) {
    const flat = Object.values(body.errors).flat()
    if (flat.length) return flat.join(' ')
  }
  return body.title || body.detail || `Request failed (${status})`
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  signal?: AbortSignal
  /** Skip the bearer token (login / register). */
  anonymous?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, anonymous = false } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (!anonymous && authToken) headers.Authorization = `Bearer ${authToken}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  if (res.status === 204 || res.status === 205) return undefined as T

  const text = await res.text()
  const parsed: unknown = text ? safeJsonParse(text) : undefined

  if (!res.ok) {
    const errBody = parsed as ApiErrorBody | undefined
    if (res.status === 401 && !anonymous) onUnauthorized?.()
    throw new ApiError(res.status, messageFromBody(res.status, errBody), errBody)
  }

  return parsed as T
}

export const http = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  del: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError || err instanceof Error) return err.message
  return 'Something went wrong.'
}
