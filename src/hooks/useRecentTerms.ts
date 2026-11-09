/** 최근 본 용어 (용어 상세를 연 순서, 최신이 앞) — 서버 연동 전까지 메모리에만 저장 */
import { useSyncExternalStore } from 'react'

const MAX = 20

let recent: string[] = []
const listeners = new Set<() => void>()

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function addRecentTerm(id: string) {
  if (recent[0] === id) return
  recent = [id, ...recent.filter((x) => x !== id)].slice(0, MAX)
  listeners.forEach((fn) => fn())
}

export function useRecentTerms(): string[] {
  return useSyncExternalStore(subscribe, () => recent)
}
