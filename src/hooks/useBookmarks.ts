/** 용어 단어장(★ 저장) — 서버 연동 전까지 메모리에만 저장 */
import { useSyncExternalStore } from 'react'

let saved = new Set<string>(['dividend', 'compound'])
const listeners = new Set<() => void>()

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function toggleBookmark(id: string) {
  saved = new Set(saved)
  if (saved.has(id)) saved.delete(id)
  else saved.add(id)
  listeners.forEach((fn) => fn())
}

export function useBookmarks(): Set<string> {
  return useSyncExternalStore(subscribe, () => saved)
}
