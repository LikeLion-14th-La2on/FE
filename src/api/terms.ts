/** 용어사전 API: 검색 · 용어 조회 · 북마크 (Notion API 명세서 · Part 3) */
import { api } from './client'

/** 검색 결과 · 북마크 · 최근 본 용어 목록에 보여 줄 만큼 */
export type TermSummary = {
  termId: number
  name: string
  easyExplanation: string
}

export type TermDetail = TermSummary & {
  /** 사전식 정의 */
  definition: string
  example: string | null
  /** 출처 (예: 한국은행 경제금융용어 700선) */
  reference: string | null
  bookmarked: boolean
}

export type Bookmark = TermSummary & { createdAt: string }

/** 이름 부분 일치, 최대 30개. 빈 검색어는 빈 목록 */
export const searchTerms = (keyword: string, signal?: AbortSignal) =>
  api<TermSummary[]>(`/api/v1/terms?${new URLSearchParams({ keyword })}`, { signal })

/** 없는 용어면 E404 '아직 준비되지 않은 용어입니다' */
export const getTerm = (termId: number, signal?: AbortSignal) =>
  api<TermDetail>(`/api/v1/terms/${termId}`, { signal })

/** 북마크 목록 (최신순) */
export const getBookmarks = (signal?: AbortSignal) =>
  api<Bookmark[]>('/api/v1/users/me/bookmarks', { signal })

/** 이미 있어도 · 없어도 그대로 성공 */
export const addBookmark = (termId: number) =>
  api<null>(`/api/v1/terms/${termId}/bookmark`, { method: 'POST' })

export const removeBookmark = (termId: number) =>
  api<null>(`/api/v1/terms/${termId}/bookmark`, { method: 'DELETE' })

/** 주소의 termId (문자열) → 숫자. 숫자가 아니면 null (없는 용어로 보여 준다) */
export function parseTermId(value: string | undefined): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
