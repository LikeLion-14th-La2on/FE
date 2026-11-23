/** 복습 API: 카드뉴스 복습 (Notion API 명세서 · Part 2) */
import { api } from './client'
import type { SessionQuestion, TermCard } from './learn'

export type ReviewCard = {
  questionId: number
  /** 카드 제목은 첫 번째 용어. 연결된 용어가 없으면 빈 배열 */
  terms: TermCard[]
  question: Omit<SessionQuestion, 'questionId'>
}

/** 학습 전에 볼 복습 대기 문제 전부 (오래된 순, 해설 없음). 다시 푼 답은 답안 제출 mode CARD_REVIEW */
export const getTodayReviews = (signal?: AbortSignal) =>
  api<{ cards: ReviewCard[] }>('/api/v1/reviews/today', { signal })
