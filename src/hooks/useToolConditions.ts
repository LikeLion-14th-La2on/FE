/**
 * 금융 도구 입력값 불러오기 · 저장 (GET · PUT /tools/conditions)
 * - 화면이 열리면 저장해 둔 값을 불러와 채운다. 불러오는 동안에도 기본값으로 바로 쓸 수 있고,
 *   저장값이 없거나 실패하면 기본값 그대로.
 * - 응답이 오기 전에 사용자가 값을 먼저 바꿨으면 덮어쓰지 않는다 → 값을 바꿀 땐 touched()를 부른다.
 * - 사용자가 값을 바꾸면, 멈추고 1초 뒤 한 번 저장한다 (슬라이더를 끄는 동안 요청이 쏟아지지 않게).
 *   1초가 지나기 전에 화면을 떠나면 그때 바로 저장한다.
 * - 저장은 있으면 좋은 정도라, 실패해도 화면에 알리지 않는다.
 */
import { useCallback, useEffect, useRef } from 'react'

import { getToolConditions, saveToolConditions, type ParamsOf, type ToolType } from '@/api/tools'

const SAVE_DELAY = 1000

export function useToolConditions<T extends ToolType>(
  toolType: T,
  params: ParamsOf<T>,
  apply: (saved: ParamsOf<T>) => void,
) {
  const touchedRef = useRef(false)
  const applyRef = useRef(apply)
  useEffect(() => {
    applyRef.current = apply
  })

  // 불러오기
  useEffect(() => {
    const controller = new AbortController()
    getToolConditions(toolType, controller.signal)
      .then((saved) => {
        if (saved && !touchedRef.current) applyRef.current(saved.params)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [toolType])

  // 화면을 떠나는 중인지 (아래 저장 effect보다 먼저 선언해야, 떠날 때 이 정리가 먼저 돈다)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // 저장: 사용자가 바꾼 뒤에만. 값이 바뀔 때마다 타이머를 다시 건다
  const key = JSON.stringify(params)
  useEffect(() => {
    if (!touchedRef.current) return
    const saved = JSON.parse(key) as ParamsOf<T>
    let done = false
    const save = () => {
      done = true
      saveToolConditions(toolType, saved).catch(() => {})
    }
    const timer = window.setTimeout(save, SAVE_DELAY)
    return () => {
      window.clearTimeout(timer)
      // 다음 값으로 바뀐 게 아니라 화면을 떠나는 거면 남은 값을 바로 저장
      if (!done && !mountedRef.current) save()
    }
  }, [toolType, key])

  return useCallback(() => {
    touchedRef.current = true
  }, [])
}
