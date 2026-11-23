/** 단계 완수: 정답률 · 도토리 · 연속 학습 · 새 용어 */
import clsx from 'clsx'
import { useLocation, useNavigate } from 'react-router'

import { Button, Character } from '@/components/common'
import { SECTORS } from '@/constants/sectors'
import { useStageParams } from '@/hooks/useStageParams'
import { STAGE_COUNT } from '@/mocks/learn'
import { ROUTES } from '@/router/routes'

import type { StageResult } from './quiz/answer'

const STAGE_ACORN = 10 // 단계 최초 완수 보상 (목업)
const STREAK_DAYS = 6 // 연속 학습일 (목업)

export default function StageCompletePage() {
  const navigate = useNavigate()
  const { sector, stage } = useStageParams()
  const result = (useLocation().state as StageResult | null) ?? {
    correct: 0,
    total: 5,
    stillWrong: 0,
    newTerms: 0,
  }
  const rate = result.total ? Math.round((result.correct / result.total) * 100) : 0
  const hasNext = stage < STAGE_COUNT

  const stats = [
    {
      label: '정답률',
      value: `${rate}%`,
      box: 'bg-coconut-100 shadow-card',
      text: 'text-avocado-600',
    },
    {
      label: '도토리',
      value: `🌰 +${STAGE_ACORN}`,
      box: 'bg-apricot-100',
      text: 'text-burnt-orange-600',
    },
    {
      label: '연속 학습',
      value: `🔥 ${STREAK_DAYS}일 연속`,
      box: 'bg-apricot-100',
      text: 'text-apricot-700',
    },
    {
      label: '새 용어',
      value: `${result.newTerms}개`,
      box: 'bg-coconut-100 shadow-card',
      text: 'text-herb-500',
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <div aria-hidden className="h-[85px] shrink-0" />
      <div className="flex justify-center">
        <Character width={171} />
      </div>
      <h1 className="text-center text-[26px] leading-[1.4] font-black text-herb">
        {SECTORS[sector].label} {stage}단계 완수!
      </h1>
      {result.stillWrong > 0 && (
        <p className="text-center text-[13px] leading-[1.4] text-avocado-400">
          틀린 문제 {result.stillWrong}개는 내일 카드뉴스로 다시 보여드려요
        </p>
      )}

      <dl className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className={clsx('flex flex-col items-center gap-1 rounded-[24px] p-4', s.box)}
          >
            <dt className={clsx('text-[12px] leading-[1.4] font-bold', s.text)}>{s.label}</dt>
            <dd className="text-[22px] leading-[1.4] font-black text-herb">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-col gap-gap pt-[85px]">
        <Button
          onClick={() =>
            navigate(hasNext ? ROUTES.termPreview(sector, stage + 1) : ROUTES.learn, {
              replace: true,
            })
          }
        >
          {hasNext ? '다음 단계로' : '다른 섹터 보러 가기'}
        </Button>
        <Button variant="secondary" onClick={() => navigate(ROUTES.home, { replace: true })}>
          홈으로
        </Button>
      </div>
    </div>
  )
}
