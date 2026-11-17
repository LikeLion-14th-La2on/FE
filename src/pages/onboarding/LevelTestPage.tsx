/**
 * 레벨 테스트: 섹터별 단계당 2문제(OX), 총 18문제
 * - '잘 모르겠어요'는 오답으로 처리 (찍어서 레벨이 높게 나오는 것 방지)
 * - 건너뛰기: 모든 섹터 1단계부터 시작
 */
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button, PeekSquirrel, QuizTopBar, SectorChip } from '@/components/common'
import { SECTOR_TEXT } from '@/constants/sectorText'
import {
  ALL_FIRST_STAGE,
  LEVEL_QUESTIONS,
  calcStartStages,
  type LevelAnswer,
} from '@/mocks/levelTest'
import { OX_CLASS } from '@/pages/learn/quiz/answer'
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

      <div className="flex gap-1.5">
        <SectorChip
          sector={question.sector}
          className={clsx('px-3! py-[5px]! text-[12px]!', SECTOR_TEXT[question.sector])}
        />
        <span className="rounded-full bg-avocado-100 px-3 py-[5px] text-[12px] leading-[1.4] font-bold text-herb">
          {question.stage}단계
        </span>
      </div>

      <section className="relative flex flex-col gap-7 rounded-[24px] bg-coconut-100 p-6 shadow-card">
        <PeekSquirrel small right={32} />
        <p className="text-[13px] leading-[1.4] font-bold text-herb">레벨 테스트</p>
        <h1 className="text-[24px] leading-[1.4] font-black whitespace-pre-line text-herb">
          {question.prompt}
        </h1>
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
          지금 나가면 모든 섹터를 1단계부터 시작해요. 테스트는 마이페이지에서 다시 볼 수 있어요.
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
