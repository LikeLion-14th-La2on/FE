/**
 * 레벨 테스트: 섹터별 단계당 2문제(OX), 총 18문제
 * - '잘 모르겠어요'는 오답으로 처리 (찍어서 레벨이 높게 나오는 것 방지)
 * - 건너뛰기: 모든 섹터 1단계부터 시작
 */
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button, QuizTopBar, SectorChip } from '@/components/common'
import {
  ALL_FIRST_STAGE,
  LEVEL_QUESTIONS,
  calcStartStages,
  type LevelAnswer,
} from '@/mocks/levelTest'
import { ROUTES } from '@/router/routes'

export default function LevelTestPage() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, LevelAnswer>>({})
  const [exitOpen, setExitOpen] = useState(false)

  const total = LEVEL_QUESTIONS.length
  const question = LEVEL_QUESTIONS[index]

  const answer = (value: LevelAnswer) => {
    const next = { ...answers, [question.id]: value }
    setAnswers(next)
    if (index + 1 < total) {
      setIndex(index + 1)
    } else {
      navigate(ROUTES.levelTestResult, {
        replace: true,
        state: { stages: calcStartStages(next), answers: next },
      })
    }
  }

  const skip = () =>
    navigate(ROUTES.levelTestResult, { replace: true, state: { stages: ALL_FIRST_STAGE } })

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <QuizTopBar value={index + 1} max={total} onClose={() => setExitOpen(true)} />

      <div className="flex gap-2">
        <SectorChip sector={question.sector} />
        <span className="rounded-full bg-apricot-100 px-2.5 py-1 text-tag text-apricot-700">
          {question.stage}단계
        </span>
      </div>

      <section className="flex flex-col gap-7 rounded-card bg-coconut-100 px-6 py-7 shadow-card">
        <p className="text-sub text-herb">레벨 테스트</p>
        <h1 className="text-question font-black whitespace-pre-line">{question.prompt}</h1>
        <div className="grid grid-cols-2 gap-3">
          {(['O', 'X'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => answer(v)}
              className={clsx(
                'flex h-24 items-center justify-center rounded-card text-[40px] font-black text-coconut-100',
                'transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-none',
                v === 'O'
                  ? 'bg-avocado-500 shadow-[0_5px_0_var(--color-avocado-700)]'
                  : 'bg-burnt-orange-500 shadow-[0_5px_0_var(--color-burnt-orange-700)]',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </section>

      <Button variant="secondary" onClick={() => answer('unknown')}>
        잘 모르겠어요
      </Button>

      <button type="button" onClick={skip} className="mt-auto py-3 text-sub text-avocado-400">
        건너뛰기 · 모든 섹터 1단계부터 시작
      </button>

      <BottomSheet open={exitOpen} onClose={() => setExitOpen(false)} labelledBy="level-exit-title">
        <h2 id="level-exit-title" className="text-title">
          레벨 테스트를 그만둘까요?
        </h2>
        <p className="text-body text-avocado-400">
          지금 나가면 모든 섹터를 1단계부터 시작해요. 테스트는 마이페이지에서 다시 볼 수 있어요.
        </p>
        <Button onClick={() => setExitOpen(false)}>계속 풀기</Button>
        <button type="button" onClick={skip} className="h-btn text-card-title text-coconut-800">
          그만두기
        </button>
      </BottomSheet>
    </div>
  )
}
