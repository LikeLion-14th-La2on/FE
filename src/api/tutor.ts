/**
 * AI 튜터 API (Notion API 명세서 · Part 3)
 * - 하루 무료 3회, 넘으면 1회당 도토리 1개 (서버 설정 기본값)
 * - 답을 받은 뒤에만 횟수·도토리가 줄어든다. 실패(E503)하면 그대로
 * - 도토리가 모자라면 E400 '도토리가 부족합니다'
 */
import { api } from './client'

export const TUTOR_FREE_PER_DAY = 3
export const TUTOR_ACORN_COST = 1

export type TutorAnswer = {
  answer: string
  /** 오늘 남은 무료 횟수 */
  freeRemaining: number
  /** 이번 질문에 쓴 도토리 (무료면 0) */
  acornSpent: number
  /** 질문 후 도토리 잔액 */
  acornBalance: number
}

export const askTutor = (termId: number, question: string) =>
  api<TutorAnswer>(`/api/v1/terms/${termId}/tutor`, { method: 'POST', body: { question } })

/*
 * 남은 무료 횟수는 질문해야만 알려 줘서, 마지막 응답 값을 오늘 날짜(한국 시간)와 함께 기억해 둔다.
 * 다시 들어왔을 때 무료를 다 쓴 걸 알면 도토리를 쓰기 전에 먼저 물어볼 수 있다.
 */
const FREE_KEY = 'tutor-free-remaining'

const todayKst = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())

export function loadFreeRemaining(): number {
  try {
    const saved = JSON.parse(localStorage.getItem(FREE_KEY) ?? 'null') as {
      date: string
      count: number
    } | null
    if (saved?.date === todayKst()) return saved.count
  } catch {
    // 저장 공간을 못 쓰면 기본값
  }
  return TUTOR_FREE_PER_DAY
}

export function saveFreeRemaining(count: number) {
  try {
    localStorage.setItem(FREE_KEY, JSON.stringify({ date: todayKst(), count }))
  } catch {
    // 저장 못 해도 이번 화면에서는 그대로 쓴다
  }
}
