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
    { label: '정답률', value: `${rate}%`, className: 'bg-coconut-100 shadow-card' },
    { label: '도토리', value: `🌰 +${STAGE_ACORN}`, className: 'bg-apricot-100' },
    { label: '연속 학습', value: `🔥 ${STREAK_DAYS}일 연속`, className: 'bg-burnt-orange-100' },
    { label: '새 용어', value: `${result.newTerms}개`, className: 'bg-coconut-100 shadow-card' },
  ]

  return (
    <div className="flex flex-1 flex-col gap-gap pt-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Character size={140} />
        <h1 className="text-title">
          {SECTORS[sector].label} {stage}단계 완수!
        </h1>
        {result.stillWrong > 0 && (
          <p className="text-sub text-avocado-400">
            틀린 문제 {result.stillWrong}개는 내일 카드뉴스로 다시 보여드려요
          </p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={clsx('flex flex-col gap-1 rounded-card px-4 py-4', s.className)}
          >
            <dt className="text-sub text-avocado-400">{s.label}</dt>
            <dd className="text-[18px] leading-tight font-black">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-col gap-3">
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
