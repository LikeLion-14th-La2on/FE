/**
 * 용어 단어장(★ 저장) — 서버 북마크
 * - 처음 쓰는 화면에서 목록을 한 번 불러와 앱 안에서 같이 쓴다 (용어사전 ↔ 용어 상세)
 * - ☆를 누르면 화면부터 바꾸고 서버에 저장, 실패하면 되돌리고 error에 안내를 남긴다
 */
import { useEffect, useSyncExternalStore } from 'react'

import {
  addBookmark,
  getBookmarks,
  removeBookmark,
  type Bookmark,
  type TermSummary,
} from '@/api/terms'

type State = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  /** 최신순 */
  items: Bookmark[]
  ids: Set<number>
  /** 마지막 저장 실패 안내 (다음 저장 때 지운다) */
  error: string | null
}

let state: State = { status: 'idle', items: [], ids: new Set(), error: null }
const listeners = new Set<() => void>()

function set(next: Partial<State>) {
  state = { ...state, ...next }
  if (next.items) state.ids = new Set(next.items.map((b) => b.termId))
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** 비운 뒤 늦게 도착한 이전 계정의 응답은 버린다 */
let generation = 0

export function loadBookmarks() {
  if (state.status === 'loading') return
  set({ status: 'loading' })
  const current = generation
  getBookmarks().then(
    (items) => current === generation && set({ status: 'ready', items }),
    () => current === generation && set({ status: 'error' }),
  )
}

/** 로그아웃 · 탈퇴할 때 비운다. 다음에 단어장을 쓰는 화면에서 새로 불러온다 */
export function resetBookmarks() {
  generation += 1
  window.clearTimeout(errorTimer)
  set({ status: 'idle', items: [], error: null })
}

const SAVE_ERROR = '저장하지 못했어요. 잠시 후 다시 시도해 주세요'

export function toggleBookmark(term: TermSummary, on: boolean) {
  const before = state.items
  const wasReady = state.status === 'ready'
  if (wasReady) {
    set({
      items: on
        ? before.filter((b) => b.termId !== term.termId)
        : [{ ...term, createdAt: new Date().toISOString() }, ...before],
      error: null,
    })
  } else {
    set({ error: null })
  }
  const current = generation
  ;(on ? removeBookmark : addBookmark)(term.termId).then(
    () => {
      // 목록을 아직 못 받은 상태였다면 저장 결과까지 담아 다시 받는다
      if (!wasReady && current === generation) loadBookmarks()
    },
    () => {
      if (current !== generation) return
      set({ ...(wasReady ? { items: before } : {}), error: SAVE_ERROR })
      window.clearTimeout(errorTimer)
      errorTimer = window.setTimeout(() => set({ error: null }), ERROR_SHOW_MS)
    },
  )
}

/** 저장 실패 안내는 잠깐만 보여 준다 (다른 화면에 남지 않게) */
const ERROR_SHOW_MS = 3000
let errorTimer = 0

export function useBookmarks(): State {
  const snapshot = useSyncExternalStore(subscribe, () => state)
  useEffect(() => {
    if (state.status === 'idle') loadBookmarks()
  }, [])
  return snapshot
}
