/**
 * 학습 API (Notion API 명세서 · Part 2)
 * - 화면 주소는 섹터·단계 번호(/learn/stock/2)를 쓰고, API는 stageId를 쓴다.
 *   findStage()가 섹터 목록 → 섹터별 단계 목록으로 stageId를 찾는다 (한 번 찾으면 기억).
 */
import type { Sector } from '@/constants/sectors'

import { ApiError, api } from './client'
import { toSector, type AnswerValue, type QuestionChoices, type QuestionType } from './types'

export type SectorItem = { sectorId: number; name: string; isToday: boolean }
export type StageStatus = 'LOCKED' | 'UNLOCKED' | 'PASSED_BY_TEST' | 'COMPLETED'
export type StageItem = { stageId: number; stepNo: number; title: string; status: StageStatus }

export type TermCard = { termId: number; name: string; easyExplanation: string; example: string }

export type SessionQuestion = {
  questionId: number
  type: QuestionType
  /** 상황형은 상황 설명만 (질문 문구는 FE 고정) */
  content: string
  choices: QuestionChoices
  /** 해설의 'AI 튜터에게 물어보기'에 쓰는 연결 용어 */
  termIds: number[]
}

export type Session = { stageId: number; terms: TermCard[]; questions: SessionQuestion[] }

export type AnswerMode = 'LEARNING' | 'RETRY' | 'CARD_REVIEW'

export type Graded = {
  correct: boolean
  /** 보낸 답과 같은 형식 (OX "X", 객관식 "1", 매칭 {"용어": "뜻"}) */
  correctAnswer: AnswerValue
  explanation: string
  reference: string
}

export type StageCompleteResult = {
  /** 오늘 첫 학습이라 보상을 받았는지 (false면 '오늘 학습 완료' 연출 없음) */
  dailyRewarded: boolean
  acornEarned: number
  acornBalance: number
  streak: number
  tree: { filledCount: number; totalCount: number; fallenCount: number }
  treeCompleted: boolean
  newTermCount: number
  cardReviewCount: number
  nextStageId: number | null
}

export const getSectors = (signal?: AbortSignal) =>
  api<{ todayCompleted: boolean; sectors: SectorItem[] }>('/api/v1/sectors', { signal })

export const getStages = (sectorId: number, signal?: AbortSignal) =>
  api<StageItem[]>(`/api/v1/sectors/${sectorId}/stages`, { signal })

/** 용어 카드 + 문제 5개 (정답·해설 없음). 잠긴 단계·오늘의 섹터가 아니면 E403 */
export const getSession = (stageId: number, signal?: AbortSignal) =>
  api<Session>(`/api/v1/stages/${stageId}/session`, { signal })

/** 한 문제 채점 + 해설. 학습 첫 풀이 LEARNING, 재출제 RETRY, 카드뉴스 CARD_REVIEW */
export const submitAnswer = (questionId: number, answer: AnswerValue, mode: AnswerMode) =>
  api<Graded>(`/api/v1/questions/${questionId}/answer`, {
    method: 'POST',
    body: { answer, mode },
  })

/** 5문제 + 재출제를 마치면 호출. correctCount는 첫 풀이에서 맞힌 수 */
export const completeStage = (stageId: number, correctCount: number) =>
  api<StageCompleteResult>(`/api/v1/stages/${stageId}/complete`, {
    method: 'POST',
    body: { correctCount },
  })

const stageCache = new Map<string, StageItem>()

/** 화면 주소의 섹터·단계 번호로 stageId를 찾는다. 없으면 E404 */
export async function findStage(
  sector: Sector,
  stepNo: number,
  signal?: AbortSignal,
): Promise<StageItem> {
  const key = `${sector}:${stepNo}`
  const cached = stageCache.get(key)
  if (cached) return cached
  const { sectors } = await getSectors(signal)
  const found = sectors.find((s) => toSector(s.name) === sector)
  if (!found) throw new ApiError('섹터를 찾을 수 없습니다', 'E404', 404)
  const stages = await getStages(found.sectorId, signal)
  for (const s of stages) stageCache.set(`${sector}:${s.stepNo}`, s)
  const stage = stages.find((s) => s.stepNo === stepNo)
  if (!stage) throw new ApiError('단계를 찾을 수 없습니다', 'E404', 404)
  return stage
}

/**
 * 오늘 학습을 시작할 곳: 오늘의 섹터에서 열려 있는 첫 단계.
 * 일요일(오늘의 섹터 없음)이거나 열린 단계가 없으면 null → 섹터 선택 화면으로.
 */
export async function findTodayStart(): Promise<{ sector: Sector; stepNo: number } | null> {
  const { sectors } = await getSectors()
  const today = sectors.find((s) => s.isToday)
  if (!today) return null
  const stages = await getStages(today.sectorId)
  const open = stages.find((s) => s.status === 'UNLOCKED')
  return open ? { sector: toSector(today.name), stepNo: open.stepNo } : null
}

/** 단계 하나의 학습 세션 (용어 미리보기 → 문제 풀이에서 같은 걸 다시 받지 않게 기억) */
const sessionCache = new Map<number, Promise<Session>>()

export async function loadStageSession(sector: Sector, stepNo: number, signal?: AbortSignal) {
  const stage = await findStage(sector, stepNo, signal)
  let session = sessionCache.get(stage.stageId)
  if (!session) {
    session = getSession(stage.stageId)
    sessionCache.set(stage.stageId, session)
    session.catch(() => sessionCache.delete(stage.stageId))
  }
  return session
}
