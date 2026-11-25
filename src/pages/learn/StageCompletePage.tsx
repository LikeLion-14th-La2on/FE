/**
 * 단계 완수: 정답률 · 도토리 · 연속 학습 · 새 용어 (단계 완수 API 응답)
 * - 문제 풀이가 단계 완수 응답과 맞힌 수를 state로 넘겨준다.
 * - dailyRewarded가 true일 때만 '오늘 학습 완료' 안내를 보여 준다 (이미 끝낸 단계를 다시 푼 경우 등은 false).
 * - 나무가 다 자라면(treeCompleted) 내 숲에 심었다고 알려 주고, '다음 단계로' 대신 나무 수확 화면으로 보낸다.
 */
import clsx from 'clsx'
import { useLocation, useNavigate } from 'react-router'

import type { StageCompleteResult } from '@/api/learn'
import { Button, Character } from '@/components/common'
import { SECTORS } from '@/constants/sectors'
import { useStageParams } from '@/hooks/useStageParams'
import type { HarvestState } from '@/pages/home/HarvestPage'
import { STAGE_COUNT } from '@/mocks/learn'
import { ROUTES } from '@/router/routes'

export type StageCompleteState = {
  result: StageCompleteResult
  /** 첫 풀이에서 맞힌 수 / 전체 문제 수 */
  correct: number
  total: number
  /** 다시 풀기에서도 틀린 문제 수 (내일 카드뉴스) */
  stillWrong: number
}

export default function StageCompletePage() {
  const navigate = useNavigate()
  const { sector, stage } = useStageParams()
  const state = useLocation().state as StageCompleteState | null
  const r = state?.result
  const rate = state?.total ? Math.round((state.correct / state.total) * 100) : 0
  const hasNext = r ? r.nextStageId !== null : stage < STAGE_COUNT

  const stats = [
    {
      label: '정답률',
      value: `${rate}%`,
      box: 'bg-coconut-100 shadow-card',
      text: 'text-avocado-600',
    },
    {
      label: '도토리',
      value: `🌰 +${r?.acornEarned ?? 0}`,
      box: 'bg-apricot-100',
      text: 'text-burnt-orange-600',
    },
    {
      label: '연속 학습',
      value: `🔥 ${r?.streak ?? 0}일 연속`,
      box: 'bg-apricot-100',
      text: 'text-apricot-700',
    },
    {
      label: '새 용어',
      value: `${r?.newTermCount ?? 0}개`,
      box: 'bg-coconut-100 shadow-card',
      text: 'text-herb-500',
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <div aria-hidden className="h-[85px] shrink-0" />
      <div className="flex justify-center">
        <Character width={171} pose="acorn" />
      </div>
      <h1 className="text-center text-[26px] leading-[1.4] font-black text-herb">
        {SECTORS[sector].label} {stage}단계 완수!
      </h1>
      {r?.dailyRewarded && (
        <p className="text-center text-[14px] leading-[1.4] font-bold text-apricot-700">
          {r.treeCompleted
            ? '오늘 학습 완료! 나무가 다 자라서 내 숲에 심었어요'
            : '오늘 학습 완료! 나무에 도토리가 붙었어요'}
        </p>
      )}
      {(state?.stillWrong ?? 0) > 0 && (
        <p className="text-center text-[13px] leading-[1.4] text-avocado-400">
          틀린 문제 {state?.stillWrong}개는 내일 카드뉴스로 다시 보여드려요
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
        {r?.treeCompleted ? (
          <Button
            onClick={() => {
              const harvest: HarvestState = { acornBalance: r.acornBalance, streak: r.streak }
              navigate(ROUTES.harvest, { replace: true, state: harvest })
            }}
          >
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
