/**
 * 최근 본 용어 (용어 상세를 연 순서, 최신이 앞)
 * 서버 API가 없어서 이 기기(localStorage)에만 저장한다. 목록에 바로 보여 주려고 이름·쉬운 설명까지 같이 둔다.
 */
import { useSyncExternalStore } from 'react'

import type { TermSummary } from '@/api/terms'

const KEY = 'recent-terms'
const MAX = 20

function read(): TermSummary[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown
    return Array.isArray(list) ? (list as TermSummary[]) : []
  } catch {
    return []
  }
}

let recent: TermSummary[] = read()
const listeners = new Set<() => void>()

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function addRecentTerm({ termId, name, easyExplanation }: TermSummary) {
  if (recent[0]?.termId === termId && recent[0].name === name) return
  recent = [{ termId, name, easyExplanation }, ...recent.filter((t) => t.termId !== termId)].slice(
    0,
    MAX,
  )
  try {
    localStorage.setItem(KEY, JSON.stringify(recent))
  } catch {
    // 저장 못 해도 이번 접속 동안은 보인다
  }
  listeners.forEach((fn) => fn())
}

export function useRecentTerms(): TermSummary[] {
  return useSyncExternalStore(subscribe, () => recent)
}
