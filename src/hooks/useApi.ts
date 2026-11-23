/**
 * 화면이 열릴 때 API로 데이터를 불러온다.
 * - key가 바뀌면 다시 부른다 (예: 주차·필터). reload()는 오류 화면의 '다시 시도'.
 * - 응답이 오기 전엔 status 'loading'. 화면을 떠나거나 key가 바뀌면 진행 중인 요청은 취소한다.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '@/api/client'

type Result<T> =
  { key: string; data: T; error: null } | { key: string; data: null; error: ApiError }

export type ApiState<T> =
  | { status: 'loading'; data: null; error: null; reload: () => void }
  | { status: 'success'; data: T; error: null; reload: () => void }
  | { status: 'error'; data: null; error: ApiError; reload: () => void }

export function useApi<T>(load: (signal: AbortSignal) => Promise<T>, key: string): ApiState<T> {
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  const [tick, setTick] = useState(0)
  const requestKey = `${key}#${tick}`
  const [result, setResult] = useState<Result<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    loadRef.current(controller.signal).then(
      (data) => setResult({ key: requestKey, data, error: null }),
      (e: unknown) => {
        if (controller.signal.aborted) return
        const error =
          e instanceof ApiError ? e : new ApiError('잠시 후 다시 시도해 주세요', 'UNKNOWN', 0)
        setResult({ key: requestKey, data: null, error })
      },
    )
    return () => controller.abort()
  }, [requestKey])

  const reload = useCallback(() => setTick((n) => n + 1), [])

  if (!result || result.key !== requestKey)
    return { status: 'loading', data: null, error: null, reload }
  if (result.error) return { status: 'error', data: null, error: result.error, reload }
  return { status: 'success', data: result.data as T, error: null, reload }
}
