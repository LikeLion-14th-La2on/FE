/**
 * 시사 퀴즈 API (Notion API 명세서 · Part 3, 2순위)
 * - 팀이 주 1회 등록. 오늘 게시분이 없으면 가장 최근 게시분, 하나도 없으면 E404
 * - 채점만 하고 기록은 남기지 않는다 (오답노트 · 스트릭 · 도토리에 반영 안 함)
 * - 유형은 OX · 4지선다 · 상황형 (매칭은 채점하지 않는다)
 */
import { api } from './client'

export type NewsQuizType = 'OX' | 'MULTIPLE' | 'SITUATION'

export type NewsQuiz = {
  quizId: number
  /** 게시일 (예: 2026-11-23) */
  publishDate: string
  question: {
    type: NewsQuizType
    content: string
    /** OX는 null */
    choices: string[] | null
  }
}

export type NewsQuizResult = {
  correct: boolean
  /** OX "O"/"X", 객관식 · 상황형 보기 번호 "0"부터 */
  correctAnswer: string
  explanation: string
}

export const getTodayNewsQuiz = (signal?: AbortSignal) =>
  api<NewsQuiz>('/api/v1/news-quizzes/today', { signal })

/** answer: OX "O"/"X", 객관식 · 상황형 "0"부터 */
export const submitNewsQuiz = (quizId: number, answer: string) =>
  api<NewsQuizResult>(`/api/v1/news-quizzes/${quizId}/answer`, {
    method: 'POST',
    body: { answer },
  })

/*
 * 서버가 기록을 남기지 않아서, 다시 들어와도 결과가 보이게 푼 결과를 이 기기에 둔다 (퀴즈가 바뀌면 안 쓴다)
 */
export type SolvedNewsQuiz = { quizId: number; answer: string; result: NewsQuizResult }
const SOLVED_KEY = 'news-quiz-solved'

export function loadSolvedNewsQuiz(quizId: number): SolvedNewsQuiz | null {
  try {
    const saved = JSON.parse(localStorage.getItem(SOLVED_KEY) ?? 'null') as SolvedNewsQuiz | null
    return saved?.quizId === quizId ? saved : null
  } catch {
    return null
  }
}

export function saveSolvedNewsQuiz(solved: SolvedNewsQuiz) {
  try {
    localStorage.setItem(SOLVED_KEY, JSON.stringify(solved))
  } catch {
    // 저장 못 해도 지금 화면에서는 결과가 보인다
  }
}

/** 로그아웃 · 탈퇴할 때 지운다 (다른 계정이 들어와도 푼 결과가 보이지 않게) */
export function clearSolvedNewsQuiz() {
  try {
    localStorage.removeItem(SOLVED_KEY)
  } catch {
    // 저장소를 못 쓰면 지울 것도 없다
  }
}
