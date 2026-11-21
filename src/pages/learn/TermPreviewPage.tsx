/**
 * 용어 미리보기: 오늘 나올 용어를 카드로 먼저 본다 ("배우고 → 확인")
 * - 카드는 좌우로 밀거나(터치·마우스), 카드 양옆 ‹ › 또는 아래 점을 눌러 넘긴다.
 * - '문제 풀러 가기'는 언제든 누를 수 있다.
 * - 용어 카드는 학습 세션 API(GET /stages/{stageId}/session)의 terms. 문제 풀이에서 같은 세션을 다시 쓴다.
 */
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Button, Loading, PageHeader, PeekSquirrel } from '@/components/common'
import { SECTORS } from '@/constants/sectors'
import { useStageParams } from '@/hooks/useStageParams'
import { useStageSession } from '@/hooks/useStageSession'
import { ROUTES } from '@/router/routes'

import SessionError from './SessionError'

/** 이만큼(px) 이상 밀면 다음/이전 카드로 넘긴다 */
const SWIPE = 40

export default function TermPreviewPage() {
  const navigate = useNavigate()
  const { sector, stage } = useStageParams()
  const session = useStageSession(sector, stage)
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)
  const terms = session.data?.terms ?? []
  const term = terms[index]

  const go = (i: number) => setIndex(Math.min(Math.max(i, 0), terms.length - 1))

  const swipeEnd = (x: number) => {
    if (startX.current === null) return
    const dx = x - startX.current
    startX.current = null
    if (dx <= -SWIPE) go(index + 1)
    else if (dx >= SWIPE) go(index - 1)
  }

  const arrow =
    'absolute top-1/2 flex h-10 w-5 -translate-y-1/2 items-center justify-center text-[20px] leading-none font-bold text-apricot-600'

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title={`${SECTORS[sector].label} ${stage}단계`} />
      {session.status === 'loading' && <Loading label="오늘 배울 용어를 준비하고 있어요" />}
      {session.status === 'error' && (
        <SessionError error={session.error} onRetry={session.reload} />
      )}
      {term && (
        <>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[17px] leading-[1.4] font-bold text-herb">오늘 배울 용어</h2>
            <span className="text-[13px] leading-[1.4] font-bold text-avocado-400">
              {index + 1} / {terms.length}
            </span>
          </div>

          <article
            aria-roledescription="카드"
            aria-label={`${index + 1}번째 용어`}
            onPointerDown={(e) => (startX.current = e.clientX)}
            onPointerUp={(e) => swipeEnd(e.clientX)}
            onPointerCancel={() => (startX.current = null)}
            className="relative flex touch-pan-y flex-col gap-gap rounded-[24px] bg-apricot-100 p-6 select-none"
          >
            <PeekSquirrel right={92} />
            <span aria-hidden className="text-[40px] leading-[1.4] font-black text-avocado-500">
              ₩
            </span>
            <h3 className="text-[30px] leading-[1.4] font-black text-apricot-700">{term.name}</h3>
            <p className="text-[17px] leading-[1.4] font-medium text-herb">
              {term.easyExplanation}
            </p>
            <div className="flex flex-col gap-1 rounded-[24px] bg-coconut-100 p-4 shadow-card">
              <p className="text-[12px] leading-[1.4] font-bold text-burnt-orange-600">예시</p>
              <p className="text-[14px] leading-[1.4] text-herb">{term.example}</p>
            </div>

            {index > 0 && (
              <button
                type="button"
                aria-label="이전 용어"
                onClick={() => go(index - 1)}
                className={clsx(arrow, 'left-1')}
              >
                ‹
              </button>
            )}
            {index < terms.length - 1 && (
              <button
                type="button"
                aria-label="다음 용어"
                onClick={() => go(index + 1)}
                className={clsx(arrow, 'right-1')}
              >
                ›
              </button>
            )}
          </article>

          <div className="flex justify-center gap-1.5">
            {terms.map((t, i) => (
              <button
                key={t.termId}
                type="button"
                aria-label={`${i + 1}번째 용어 보기`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={clsx(
                  'size-2 rounded-full',
                  i === index ? 'bg-burnt-orange-500' : 'bg-coconut-600',
                )}
              />
            ))}
          </div>

          <Button
            className="mt-auto"
            onClick={() => navigate(ROUTES.quiz(sector, stage), { replace: true })}
          >
            문제 풀러 가기
          </Button>
        </>
      )}
    </div>
  )
}
