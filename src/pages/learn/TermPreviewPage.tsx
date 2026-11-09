/**
 * 용어 미리보기: 오늘 나올 용어를 카드로 먼저 본다 ("배우고 → 확인")
 * - 카드는 좌우로 밀거나 아래 점을 눌러 넘긴다.
 * - '문제 풀러 가기'는 언제든 누를 수 있다.
 */
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Button, PageHeader } from '@/components/common'
import { SECTORS } from '@/constants/sectors'
import { useStageParams } from '@/hooks/useStageParams'
import { getStageContent } from '@/mocks/learn'
import { ROUTES } from '@/router/routes'

/** 이만큼(px) 이상 밀면 다음/이전 카드로 넘긴다 */
const SWIPE = 40

export default function TermPreviewPage() {
  const navigate = useNavigate()
  const { sector, stage } = useStageParams()
  const { terms } = getStageContent(sector)
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)
  const term = terms[index]

  const go = (i: number) => setIndex(Math.min(Math.max(i, 0), terms.length - 1))

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title={`${SECTORS[sector].label} ${stage}단계`} />

      <div className="flex items-center justify-between">
        <h1 className="text-card-title">오늘 배울 용어</h1>
        <span className="text-sub font-bold text-avocado-400">
          {index + 1} / {terms.length}
        </span>
      </div>

      <article
        aria-roledescription="카드"
        aria-label={`${index + 1}번째 용어`}
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return
          const dx = e.clientX - startX.current
          startX.current = null
          if (dx <= -SWIPE) go(index + 1)
          else if (dx >= SWIPE) go(index - 1)
        }}
        className="flex touch-pan-y flex-col gap-3 rounded-card bg-apricot-100 px-6 py-6 shadow-card select-none"
      >
        <span aria-hidden className="text-[40px] leading-none font-black text-avocado-500">
          {term.icon}
        </span>
        <h2 className="mt-2 text-[30px] leading-tight font-black text-apricot-700">{term.name}</h2>
        <p className="text-[17px] leading-normal font-medium">{term.meaning}</p>
        <div className="mt-1 rounded-option bg-coconut-100 px-4 py-3 shadow-option">
          <p className="text-sub font-bold text-burnt-orange-600">예시</p>
          <p className="text-body">{term.example}</p>
        </div>
      </article>

      <div className="flex justify-center gap-1.5">
        {terms.map((t, i) => (
          <button
            key={t.id}
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
    </div>
  )
}
