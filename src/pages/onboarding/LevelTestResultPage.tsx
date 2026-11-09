/** 레벨 테스트 결과: 섹터별 시작 단계 + 문제별 해설 */
import clsx from 'clsx'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Button, Character, PageHeader } from '@/components/common'
import { SECTORS, type Sector } from '@/constants/sectors'
import {
  ALL_FIRST_STAGE,
  LEVEL_QUESTIONS,
  type LevelAnswer,
  type LevelResult,
} from '@/mocks/levelTest'
import { ROUTES } from '@/router/routes'

const ROW_CLASS: Record<Sector, { row: string; text: string }> = {
  stock: { row: 'bg-apricot-100', text: 'text-apricot-700' },
  life: { row: 'bg-avocado-100', text: 'text-avocado-600' },
  basic: {
    row: 'bg-burnt-orange-100',

    text: 'text-burnt-orange-600',
  },
}

type State = { stages?: LevelResult; answers?: Record<string, LevelAnswer> } | null

export default function LevelTestResultPage() {
  const navigate = useNavigate()
  const state = useLocation().state as State
  const stages = state?.stages ?? ALL_FIRST_STAGE
  const answers = state?.answers
  const [showAll, setShowAll] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader onBack={() => navigate(ROUTES.home, { replace: true })} />

      <div className="flex flex-col items-center gap-4 pt-2">
        <Character size={120} />
        <h1 className="text-title">이 단계부터 시작해요!</h1>
      </div>

      <ul className="flex flex-col gap-3">
        {(Object.keys(SECTORS) as Sector[]).map((sector) => {
          const c = ROW_CLASS[sector]
          return (
            <li
              key={sector}
              className={clsx('flex items-center gap-3 rounded-card px-4 py-4', c.row)}
            >
              <span
                className="flex size-10 items-center justify-center rounded-xl bg-coconut-100 text-xl"
                aria-hidden
              >
                {SECTORS[sector].emoji}
              </span>
              <span className="flex-1 text-card-title">{SECTORS[sector].label}</span>
              <span className={clsx('text-card-title', c.text)}>{stages[sector]}단계부터</span>
            </li>
          )
        })}
      </ul>

      {answers && (
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((v) => !v)}
          className="text-sub text-avocado-400"
        >
          문제별 해설 {showAll ? '접기 ∧' : '한꺼번에 보기 >'}
        </button>
      )}

      {answers && showAll && (
        <ol className="flex flex-col gap-2">
          {LEVEL_QUESTIONS.map((q, i) => {
            const mine = answers[q.id]
            const ok = mine === q.answer
            return (
              <li key={q.id} className="rounded-option bg-coconut-100 px-4 py-3 shadow-option">
                <p className="text-sub text-avocado-400">
                  {i + 1}. {SECTORS[q.sector].label} {q.stage}단계 ·{' '}
                  <span className={ok ? 'text-avocado-600' : 'text-burnt-orange-600'}>
                    {ok ? '맞혔어요' : mine === 'unknown' ? '잘 모르겠어요' : '틀렸어요'}
                  </span>
                </p>
                <p className="text-card-title">{q.prompt.replace('\n', ' ')}</p>
                <p className="text-body text-avocado-400">
                  정답 {q.answer} · {q.explanation}
                </p>
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
