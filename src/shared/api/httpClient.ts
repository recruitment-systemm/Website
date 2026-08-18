const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL
const JOB_SERVICE_URL = import.meta.env.VITE_JOB_SERVICE_URL
const APPLICATION_SERVICE_URL = import.meta.env.VITE_APPLICATION_SERVICE_URL

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * The envelope every backend response is wrapped in. `statusCode` only
 * appears on authentication-service responses — job-service and
 * Application-Interview-Services omit it — so it's optional here rather than
 * split into two types.
 */
interface ApiResponse<T> {
  success: boolean
  statusCode?: number
  message?: string
  data: T
}

interface RequestOptions extends RequestInit {
  /** Skip the 401-refresh-retry dance, e.g. for the refresh call itself. */
  skipAuthRetry?: boolean
}

let refreshPromise: Promise<boolean> | null = null

/**
 * Attempts to reissue the `Access` cookie via the `Refresh` cookie. Shared
 * across every in-flight 401 so concurrent requests don't each trigger their
 * own refresh call.
 */
function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${AUTH_SERVICE_URL}/api/v1/organizations/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function isEnvelope(body: unknown): body is ApiResponse<unknown> {
  return typeof body === 'object' && body !== null && typeof (body as { success?: unknown }).success === 'boolean'
}

/**
 * Most endpoints wrap their response in `ApiResponse<T>` (`{success, data}`),
 * but a few on authentication-service — `POST /employees`, `/employees/login`,
 * `/employees/profile` — return the raw DTO directly on success (error paths
 * still go through `GlobalExceptionHandler`'s `ErrorResponse`, which *is*
 * enveloped). Detect the shape per response rather than assuming one.
 */
async function parseResponse<T>(response: Response): Promise<T> {
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // No JSON body (e.g. empty 204) — fall through to status-based handling.
  }

  const envelope = isEnvelope(body) ? body : null

  if (!response.ok || envelope?.success === false) {
    const message = envelope?.message ?? response.statusText ?? 'Request failed'
    throw new ApiError(response.status, message)
  }

  if (envelope) {
    return (envelope.data as T) ?? (undefined as T)
  }

  return body as T
}

async function request<T>(baseUrl: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuthRetry, headers, body, ...rest } = options
  const isFormData = body instanceof FormData

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    body,
    credentials: 'include',
    headers: isFormData
      ? headers
      : { 'Content-Type': 'application/json', ...(headers as Record<string, string> | undefined) },
  })

  if (response.status === 401 && !skipAuthRetry) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return request<T>(baseUrl, path, { ...options, skipAuthRetry: true })
    }
  }

  return parseResponse<T>(response)
}

function makeClient(baseUrl: string) {
  return {
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>(baseUrl, path, { ...options, method: 'GET' })
    },
    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      const isFormData = body instanceof FormData
      return request<T>(baseUrl, path, {
        ...options,
        method: 'POST',
        body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      })
    },
    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>(baseUrl, path, {
        ...options,
        method: 'PATCH',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    },
    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>(baseUrl, path, { ...options, method: 'DELETE' })
    },
  }
}

export const authClient = makeClient(AUTH_SERVICE_URL)
export const jobClient = makeClient(JOB_SERVICE_URL)
export const applicationClient = makeClient(APPLICATION_SERVICE_URL)

/**
 * `GET /organizations/linkedin` is a full-page redirect straight to
 * LinkedIn's OAuth consent screen (`response.sendRedirect`, not a JSON
 * response) — it can't go through `authClient`/`fetch` like everything
 * else; the browser has to navigate there directly.
 */
export const AUTH_SERVICE_BASE_URL = AUTH_SERVICE_URL
