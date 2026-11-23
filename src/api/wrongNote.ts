/** 오답노트 API (Notion API 명세서 · Part 2) */
import { api } from './client'
import type { AnswerValue, QuestionChoices, QuestionType } from './types'

export type WrongNoteItem = {
  wrongAnswerId: number
  questionId: number
  sectorName: string
  type: QuestionType
  content: string
  choices: QuestionChoices
  /** 답안 제출 형식 (OX "O", 객관식 "0"부터, 매칭 {"용어": "뜻"}) */
  myAnswer: AnswerValue
  correctAnswer: AnswerValue
  explanation: string
  reference: string
  /** 오답노트에 들어간 시각 (한국 시간) */
  wrongAt: string
}

export type WrongNoteWeek = {
  /** ISO 주차 (예: 2026-W45) */
  week: string
  /** 화면 표시용 (예: 11월 1주차) */
  weekLabel: string
  /** wrongAt 최신순 */
  items: WrongNoteItem[]
}

/** week를 빼면 이번 주. 섹터 필터는 화면에서 거른다 (전체 개수도 보여 줘야 해서) */
export const getWrongNotes = (week: string | null, signal?: AbortSignal) =>
  api<WrongNoteWeek>(`/api/v1/wrong-answers${week ? `?week=${encodeURIComponent(week)}` : ''}`, {
    signal,
  })

/** ISO 주차 문자열을 delta주만큼 옮긴다 (예: 2026-W01, -1 → 2025-W52) */
export function shiftWeek(week: string, delta: number): string {
  const m = /^(\d{4})-W(\d{2})$/.exec(week)
  if (!m) return week
  const year = Number(m[1])
  const num = Number(m[2])
  // 그 해 첫 주(1월 4일이 든 주)의 월요일에서 주 수만큼 더한다
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7) + (num - 1 + delta) * 7)
  return toIsoWeek(monday)
}

function toIsoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = (t.getUTCDay() + 6) % 7 // 월=0
  t.setUTCDate(t.getUTCDate() - day + 3) // 그 주 목요일이 속한 해가 ISO 연도
  const year = t.getUTCFullYear()
  const firstThursday = new Date(Date.UTC(year, 0, 4))
  firstThursday.setUTCDate(4 - ((firstThursday.getUTCDay() + 6) % 7) + 2)
  const week = 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 86400000))
  return `${year}-W${String(week).padStart(2, '0')}`
}
