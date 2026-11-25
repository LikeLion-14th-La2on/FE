/**
 * 지금 장착한 캐릭터(옷) code를 앱 전체가 같이 쓴다
 * - 처음 필요할 때 캐릭터 목록(GET /characters)에서 equipped인 것을 한 번만 찾는다 (로그인 전이면 부르지 않음)
 * - 상점에서 장착을 바꾸면 setEquippedCharacterCode로 바로 반영 → 모든 화면 다람쥐가 함께 바뀐다
 * - 불러오기 전 · 실패하면 null → 기본 다람쥐
 * - 로그아웃 · 탈퇴하면 resetEquippedCharacter로 비운다 (다른 계정으로 로그인할 수 있어서)
 */
import { useEffect, useSyncExternalStore } from 'react'

import { getCharacters } from '@/api/character'

let code: string | null = null
let status: 'idle' | 'loading' | 'done' = 'idle'
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function hasToken() {
  try {
    return localStorage.getItem('accessToken') !== null
  } catch {
    return false
  }
}

function load() {
  if (status !== 'idle' || !hasToken()) return
  status = 'loading'
  getCharacters()
    .then((list) => {
      code = list.find((c) => c.equipped)?.code ?? null
    })
    .catch(() => {
      // 못 불러와도 기본 다람쥐로 보여 주면 되니, 같은 화면에서 다시 부르지 않는다
    })
    .finally(() => {
      status = 'done'
      emit()
    })
}

export function useEquippedCharacterCode() {
  const current = useSyncExternalStore(subscribe, () => code)
  useEffect(load, [])
  return current
}

export function setEquippedCharacterCode(next: string | null) {
  code = next
  status = 'done'
  emit()
}

export function resetEquippedCharacter() {
  code = null
  status = 'idle'
  emit()
}
