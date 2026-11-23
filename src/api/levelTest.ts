/** 레벨 테스트 API (Notion API 명세서 · Part 3) */
import { api } from './client'
import type { QuestionType } from './types'

export type LevelTestQuestion = {
  questionId: number
  stepNo: number
  type: Exclude<QuestionType, 'MATCHING'>
  /** OX·객관식은 문제 문장, 상황형은 상황 설명만 (질문 문구는 FE 고정) */
  content: string
  choices: string[] | null
}

export type LevelTestSector = { sectorId: number; name: string; questions: LevelTestQuestion[] }

export type LevelTestSectorResult = { sectorId: number; name: string; startStepNo: number }

export type LevelTestExplanation = {
  questionId: number
  correct: boolean
  correctAnswer: string
  explanation: string
}

export type LevelTestResult = {
  results: LevelTestSectorResult[]
  explanations: LevelTestExplanation[]
}

/** 섹터마다 단계당 2문제 (정답은 오지 않음) */
export const getLevelTestQuestions = (signal?: AbortSignal) =>
  api<{ sectors: LevelTestSector[] }>('/api/v1/level-test/questions', { signal })

/** 답을 한 번에 제출 → 섹터별 시작 단계 + 문제별 해설. 이미 했거나 건너뛰었으면 E409 */
export const submitLevelTest = (answers: { questionId: number; answer: string }[]) =>
  api<LevelTestResult>('/api/v1/level-test/result', { method: 'POST', body: { answers } })

/** 건너뛰기: 모든 섹터 1단계부터. 이미 했거나 건너뛰었으면 E409 */
export const skipLevelTest = () => api<null>('/api/v1/level-test/skip', { method: 'POST' })
