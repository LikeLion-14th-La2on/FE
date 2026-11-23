/**
 * 레벨 테스트: 섹터마다 단계당 2문제 (서버 GET /level-test/questions)
 * - 문제 유형: OX(큰 버튼 2개) · 4지선다 · 상황형(상황 카드 + 고정 질문). 매칭은 나오지 않는다.
 * - 답을 누르면 눌린 모습을 잠깐 보여 준 뒤 다음 문제로 넘어간다 (빠르게 두 번 눌러 다음 문제까지 답하는 것 방지).
 * - '잘 모르겠어요'는 UNKNOWN(오답 처리)으로 보낸다.
 * - 마지막 문제를 답하면 한 번에 제출(POST /level-test/result) → 결과 화면.
 * - 건너뛰기·그만두기: POST /level-test/skip → 모든 섹터 1단계부터.
 * - 이미 테스트를 했거나 건너뛴 사용자(E409)는 홈으로 보낸다.
 * - ✕나 휴대폰 뒤로가기 → 그만두기 확인 시트
 */
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { ApiError } from '@/api/client'
import {
  getLevelTestQuestions,
  skipLevelTest,
  submitLevelTest,
  type LevelTestQuestion,
  type LevelTestSectorResult,
} from '@/api/levelTest'
import { toSector } from '@/api/types'
import {
  BottomSheet,
  Button,
  LoadError,
  Loading,
  PeekSquirrel,
  QuizTopBar,
  SectorChip,
} from '@/components/common'
import type { Sector } from '@/constants/sectors'
import { SECTOR_TEXT } from '@/constants/sectorText'
import { useApi } from '@/hooks/useApi'
import { useConfirmBack } from '@/hooks/useConfirmBack'
import { CIRCLED, OX_CLASS, SITUATION_PROMPT } from '@/pages/learn/quiz/answer'
import QuizOption from '@/pages/learn/quiz/QuizOption'
import { ROUTES } from '@/router/routes'

import type { LevelTestResultState } from './LevelTestResultPage'

/** 답을 누른 뒤 다음 문제로 넘어가기까지 (눌린 모습을 보여 주는 시간) */
const NEXT_DELAY = 180

export type LevelItem = LevelTestQuestion & { sector: Sector; sectorId: number; sectorName: string }

export default function LevelTestPage() {
  const navigate = useNavigate()
  const questions = useApi(getLevelTestQuestions, 'level-test-questions')

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [picked, setPicked] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<ApiError | null>(null)
  const [exitOpen, setExitOpen] = useState(false)
  const locked = useRef(false)
  useConfirmBack(() => setExitOpen(true), !sending)

  const items: LevelItem[] =
    questions.data?.sectors.flatMap((s) =>
      s.questions.map((q) => ({
        ...q,
        sector: toSector(s.name),
        sectorId: s.sectorId,
        sectorName: s.name,
      })),
    ) ?? []

  /** 이미 테스트를 끝낸 사용자는 홈으로, 그 밖의 오류는 화면에 보여 준다 */
  const handleError = (e: unknown) => {
    if (e instanceof ApiError && e.code === 'E409') {
      navigate(ROUTES.home, { replace: true })
      return
    }
    setSendError(
      e instanceof ApiError ? e : new ApiError('잠시 후 다시 시도해 주세요', 'UNKNOWN', 0),
    )
  }

  const submit = (all: Record<number, string>) => {
    setSending(true)
    setSendError(null)
    submitLevelTest(items.map((q) => ({ questionId: q.questionId, answer: all[q.questionId] })))
      .then((result) => {
        const state: LevelTestResultState = { ...result, questions: items, answers: all }
        navigate(ROUTES.levelTestResult, { replace: true, state })
      })
      .catch(handleError)
      .finally(() => setSending(false))
  }

  const skip = () => {
    setExitOpen(false)
    setSending(true)
    setSendError(null)
    skipLevelTest()
      .then(() => {
        const results: LevelTestSectorResult[] = (questions.data?.sectors ?? []).map((s) => ({
          sectorId: s.sectorId,
          name: s.name,
          startStepNo: 1,
        }))
        const state: LevelTestResultState = { results, explanations: [] }
        navigate(ROUTES.levelTestResult, { replace: true, state })
      })
      .catch(handleError)
      .finally(() => setSending(false))
  }

  const answer = (value: string) => {
    if (locked.current) return
    locked.current = true
    setPicked(value)
    const q = items[index]
    const next = { ...answers, [q.questionId]: value }
    window.setTimeout(() => {
      setAnswers(next)
      setPicked(null)
      locked.current = false
      if (index + 1 < items.length) setIndex(index + 1)
      else submit(next)
    }, NEXT_DELAY)
  }

  if (questions.status === 'loading') return <Loading label="레벨 테스트를 준비하고 있어요" />
  if (questions.status === 'error') {
    if (questions.error.code === 'E409') return <Navigate to={ROUTES.home} replace />
    return <LoadError message={questions.error.message} onRetry={questions.reload} />
  }
  if (sendError) {
    const allAnswered = items.every((q) => answers[q.questionId] !== undefined)
    return (
      <LoadError
        message={sendError.message}
        onRetry={allAnswered ? () => submit(answers) : () => setSendError(null)}
      />
    )
  }
  if (sending) return <Loading label="결과를 정리하고 있어요" />
  if (items.length === 0) return <LoadError message="레벨 테스트 문제를 준비하고 있어요" />

  const q = items[index]

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <QuizTopBar value={index + 1} max={items.length} onClose={() => setExitOpen(true)} />

      <div className="flex gap-1.5">
        <SectorChip
          sector={q.sector}
          className={clsx('px-3! py-[5px]! text-[12px]!', SECTOR_TEXT[q.sector])}
        />
        <span className="rounded-full bg-avocado-100 px-3 py-[5px] text-[12px] leading-[1.4] font-bold text-herb">
          {q.stepNo}단계
        </span>
      </div>

      <section
        key={q.questionId}
        className={clsx(
          'relative flex flex-col rounded-[24px] bg-coconut-100 p-6 shadow-card',
          q.type === 'SITUATION' ? 'gap-[18px]' : 'gap-7',
        )}
      >
        <PeekSquirrel small right={32} />
        <p className="text-[13px] leading-[1.4] font-bold text-herb">레벨 테스트</p>
        {q.type === 'SITUATION' && (
          <p className="rounded-[24px] bg-apricot-100 px-4 py-[15px] text-[15px] leading-[1.4] text-apricot-800">
            {q.content}
          </p>
        )}
        <h1 className="text-[24px] leading-[1.4] font-black whitespace-pre-line text-herb">
          {q.type === 'SITUATION' ? SITUATION_PROMPT : q.content}
        </h1>

        {q.type === 'OX' ? (
          <div className="grid grid-cols-2 gap-3 pb-1">
            {(['O', 'X'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => answer(v)}
                className={clsx(
                  'flex h-24 items-center justify-center rounded-[24px] text-[40px] leading-[1.4] font-black text-coconut-500',
                  'transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-none',
                  OX_CLASS[v],
                  picked === v && 'translate-y-1 shadow-none',
                )}
              >
                {v}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {(q.choices ?? []).map((opt, i) => (
              <QuizOption
                key={opt}
                state={picked === String(i) ? 'selected' : 'default'}
                onClick={() => answer(String(i))}
              >
                {`${CIRCLED[i]}  ${opt}`}
              </QuizOption>
            ))}
          </div>
        )}
      </section>

      <Button variant="secondary" onClick={() => answer('UNKNOWN')}>
        잘 모르겠어요
      </Button>

      <button
        type="button"
        onClick={skip}
        className="mt-auto py-3 text-[13px] leading-[1.4] font-medium text-avocado-400"
      >
        건너뛰기 · 모든 섹터 1단계부터 시작
      </button>

      <BottomSheet
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        labelledBy="level-exit-title"
        peek
      >
        <h2 id="level-exit-title" className="text-[20px] leading-[1.4] font-black text-herb">
          레벨 테스트를 그만둘까요?
        </h2>
        <p className="text-[14px] leading-[1.5] text-herb">
          지금 나가면 모든 섹터를 1단계부터 시작해요.
        </p>
        <Button onClick={() => setExitOpen(false)}>계속 풀기</Button>
        <button
          type="button"
          onClick={skip}
          className="h-btn text-[16px] leading-[1.4] font-bold text-avocado-400"
        >
          그만두기
        </button>
      </BottomSheet>
    </div>
  )
}
