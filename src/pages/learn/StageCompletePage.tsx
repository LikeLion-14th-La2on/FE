/** 단계 완수: 정답률 · 도토리 · 연속 학습 · 새 용어 */
import clsx from 'clsx'
import { useLocation, useNavigate } from 'react-router'

import { Button, Character } from '@/components/common'
import { SECTORS } from '@/constants/sectors'
import { isHarvestDay } from '@/constants/tree'
import { useStageParams } from '@/hooks/useStageParams'
import { STAGE_COUNT } from '@/mocks/learn'
import { ROUTES } from '@/router/routes'

import type { StageResult } from './quiz/answer'

const STAGE_ACORN = 10 // 단계 최초 완수 보상 (목업)
const STREAK_DAYS = 6 // 연속 학습일 (목업)
// TODO: 단계 완수 응답의 누적 학습일(user_streaks.total_study_days)로 교체
const TOTAL_STUDY_DAYS = 7

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
  // 오늘 학습으로 도토리 7개를 다 채웠으면 다음 단계 대신 수확 화면으로 먼저 보낸다
  const harvest = isHarvestDay(TOTAL_STUDY_DAYS)

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
    <div className="flex flex-1 flex-col gap-gap pt-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Character size={140} />
        <h1 className="text-[26px] leading-tight font-black">
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
            className={clsx('flex flex-col items-center gap-1 rounded-option px-4 py-4', s.box)}
          >
            <dt className={clsx('text-sub font-bold', s.text)}>{s.label}</dt>
            <dd className="text-[22px] leading-tight font-black">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-col gap-3">
        {harvest ? (
          <Button onClick={() => navigate(ROUTES.harvest, { replace: true })}>
            🎉 나무 수확하러 가기
          </Button>
        ) : (
          <Button
            onClick={() =>
              navigate(hasNext ? ROUTES.termPreview(sector, stage + 1) : ROUTES.learn, {
                replace: true,
              })
            }
          >
            {hasNext ? '다음 단계로' : '다른 섹터 보러 가기'}
          </Button>
        )}
        <Button variant="secondary" onClick={() => navigate(ROUTES.home, { replace: true })}>
          홈으로
        </Button>
      </div>
    </div>
  )
}
