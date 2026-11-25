/**
 * 레벨 테스트 결과: 섹터별 시작 단계 + 문제별 해설
 * - 레벨 테스트 화면이 제출 응답(results·explanations)과 푼 문제·답을 state로 넘겨준다.
 * - 건너뛰기로 오면 해설 없이 모든 섹터 1단계.
 * - 주소로 바로 들어오면(state 없음) 섹터 3개 모두 1단계로 보여 준다.
 */
import clsx from 'clsx'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import type { LevelTestResult } from '@/api/levelTest'
import { toSector } from '@/api/types'
import { Button, Character, PageHeader } from '@/components/common'
import { SECTORS, type Sector } from '@/constants/sectors'
import { CIRCLED } from '@/pages/learn/quiz/answer'
import { ROUTES } from '@/router/routes'

import type { LevelItem } from './LevelTestPage'

const ROW_CLASS: Record<Sector, { row: string; text: string }> = {
  stock: { row: 'bg-apricot-100', text: 'text-apricot-700' },
  life: { row: 'bg-avocado-100', text: 'text-avocado-600' },
  basic: { row: 'bg-burnt-orange-100', text: 'text-burnt-orange-600' },
}

export type LevelTestResultState = LevelTestResult & {
  questions?: LevelItem[]
  answers?: Record<number, string>
}

const FALLBACK: LevelTestResultState = {
  results: (Object.keys(SECTORS) as Sector[]).map((s, i) => ({
    sectorId: i + 1,
    name: SECTORS[s].label,
    startStepNo: 1,
  })),
  explanations: [],
}

/** 답("O", "1", "UNKNOWN")을 화면 글자로: 객관식은 "② 배당" */
function answerText(value: string | undefined, choices: string[] | null) {
  if (value === undefined) return '-'
  if (value === 'UNKNOWN') return '잘 모르겠어요'
  if (choices) {
    const i = Number(value)
    return Number.isInteger(i) && choices[i] !== undefined ? `${CIRCLED[i]} ${choices[i]}` : value
  }
  return value
}

export default function LevelTestResultPage() {
  const navigate = useNavigate()
  const state = (useLocation().state as LevelTestResultState | null) ?? FALLBACK
  const [showAll, setShowAll] = useState(false)
  const explanations = new Map(state.explanations.map((e) => [e.questionId, e]))
  const questions = state.questions ?? []
  const canShowAll = questions.length > 0 && explanations.size > 0

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader onBack={() => navigate(ROUTES.home, { replace: true })} />

      <div className="flex justify-center">
        <Character width={137} pose="cheer" />
      </div>
      <h1 className="text-center text-[22px] leading-[1.4] font-black text-herb">
        이 단계부터 시작해요!
      </h1>

      {state.results.map((r) => {
        const sector = toSector(r.name)
        const c = ROW_CLASS[sector]
        return (
          <div
            key={r.sectorId}
            className={clsx('flex items-center gap-3 rounded-[24px] px-[18px] py-4', c.row)}
          >
            <span
              aria-hidden
              className="flex h-[41px] w-[34px] items-center justify-center rounded-[9.6px] bg-coconut-100 text-[18px]"
            >
              {SECTORS[sector].emoji}
            </span>
            <span className="flex-1 text-[17px] leading-[1.4] font-bold text-herb">{r.name}</span>
            <span className={clsx('text-[15px] leading-[1.4] font-bold', c.text)}>
              {r.startStepNo}단계부터
            </span>
          </div>
        )
      })}

      {canShowAll && (
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((v) => !v)}
          className="text-[13px] leading-[1.4] font-medium text-avocado-400"
        >
          문제별 해설 {showAll ? '접기 ∧' : '한꺼번에 보기 >'}
        </button>
      )}

      {canShowAll && showAll && (
        <ol className="flex flex-col gap-2">
          {questions.map((q, i) => {
            const e = explanations.get(q.questionId)
            const mine = state.answers?.[q.questionId]
            return (
              <li
                key={q.questionId}
                className="flex flex-col gap-1 rounded-[24px] bg-coconut-100 px-4 py-3 shadow-card"
              >
                <p className="text-[12px] leading-[1.4] font-medium text-avocado-400">
                  {i + 1}. {q.sectorName} {q.stepNo}단계 ·{' '}
                  <span className={e?.correct ? 'text-avocado-600' : 'text-burnt-orange-600'}>
                    {e?.correct ? '맞혔어요' : mine === 'UNKNOWN' ? '잘 모르겠어요' : '틀렸어요'}
                  </span>
                </p>
                <p className="text-[15px] leading-[1.4] font-bold text-herb">
                  {q.content.replace(/\n/g, ' ')}
                </p>
                {e && (
                  <p className="text-[13px] leading-[1.5] text-avocado-400">
                    정답 {answerText(e.correctAnswer, q.choices)}
                    {!e.correct && ` · 내 답 ${answerText(mine, q.choices)}`} · {e.explanation}
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      )}

      <Button className="mt-auto" onClick={() => navigate(ROUTES.home, { replace: true })}>
        홈으로 가기
      </Button>
    </div>
  )
}
