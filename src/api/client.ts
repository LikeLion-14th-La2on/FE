/**
 * 백엔드 API 공통 호출 (`/api/v1/...`)
 * - 로그인 토큰(localStorage accessToken)을 Authorization 헤더에 붙인다.
 * - 응답 `{ code, message, data }`에서 data만 돌려준다. 실패하면 ApiError(서버 message 그대로)를 던진다.
 * - 토큰이 만료돼 401이 오면 refreshToken으로 한 번 재발급받아 다시 요청한다.
 *   재발급도 실패하면 토큰을 지우고 로그인 화면으로 보낸다.
 */
import { ROUTES } from '@/router/routes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/** 실패 응답 (code 예: E400, E401, E403, E404, E409, E503) */
export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

const NETWORK_MESSAGE = '인터넷 연결을 확인하고 다시 시도해 주세요'
const DEFAULT_MESSAGE = '잠시 후 다시 시도해 주세요'

async function send(path: string, { method = 'GET', body, signal }: Options) {
  const token = localStorage.getItem('accessToken')
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

/** 재발급은 한 번에 하나만 (동시에 여러 요청이 401을 받아도 한 번만 재발급) */
let refreshing: Promise<boolean> | null = null

function refreshToken(): Promise<boolean> {
  refreshing ??= (async () => {
    const refresh = localStorage.getItem('refreshToken')
    if (!refresh) return false
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.data?.accessToken) return false
      localStorage.setItem('accessToken', json.data.accessToken)
      localStorage.setItem('refreshToken', json.data.refreshToken)
      return true
    } catch {
      return false
    }
  })().finally(() => {
    refreshing = null
  })
  return refreshing
}

function goLogin() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  if (window.location.pathname !== ROUTES.login) window.location.replace(ROUTES.login)
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  let res: Response
  try {
    res = await send(path, options)
    if (res.status === 401 && (await refreshToken())) res = await send(path, options)
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(NETWORK_MESSAGE, 'NETWORK', 0)
  }

  const json = await res.json().catch(() => null)
  if (res.status === 401) {
    goLogin()
    throw new ApiError(json?.message ?? '로그인이 필요합니다', 'E401', 401)
  }
  if (!res.ok) {
    throw new ApiError(json?.message ?? DEFAULT_MESSAGE, json?.code ?? `E${res.status}`, res.status)
  }
  return json?.data as T
}
