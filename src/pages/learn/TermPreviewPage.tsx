/** 용어 미리보기: 오늘 나올 용어를 카드로 먼저 본다 ("배우고 → 확인") */
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button, PageHeader } from '@/components/common'
import { SECTORS } from '@/constants/sectors'
import { useStageParams } from '@/hooks/useStageParams'
import { getStageContent } from '@/mocks/learn'
import { ROUTES } from '@/router/routes'

export default function TermPreviewPage() {
  const navigate = useNavigate()
  const { sector, stage } = useStageParams()
  const { terms } = getStageContent(sector)
  const [index, setIndex] = useState(0)
  const term = terms[index]
  const isLast = index === terms.length - 1

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title={`${SECTORS[sector].label} ${stage}단계`} />

      <div className="flex items-center justify-between">
        <h1 className="text-title">오늘 배울 용어</h1>
        <span className="text-sub text-avocado-400">
          {index + 1} / {terms.length}
        </span>
      </div>

      <article className="flex flex-col gap-4 rounded-card bg-apricot-100 px-6 py-7 shadow-card">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-2xl bg-coconut-100 text-xl"
        >
          {SECTORS[sector].emoji}
        </span>
        <h2 className="text-[28px] leading-tight font-black">{term.name}</h2>
        <p className="text-card-title font-medium">{term.meaning}</p>
        <div className="rounded-option bg-coconut-100 px-4 py-3">
          <p className="text-tag text-apricot-700">예시</p>
          <p className="text-body">{term.example}</p>
        </div>
      </article>

      <div className="flex justify-center gap-1.5" aria-hidden>
        {terms.map((t, i) => (
          <span
            key={t.id}
            className={
              i === index
                ? 'h-2 w-5 rounded-full bg-apricot-500'
                : 'size-2 rounded-full bg-apricot-200'
            }
          />
        ))}
      </div>

      <div className="mt-auto flex gap-3">
        {index > 0 && (
          <Button variant="secondary" className="flex-1" onClick={() => setIndex(index - 1)}>
            이전 용어
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={() =>
            isLast ? navigate(ROUTES.quiz(sector, stage), { replace: true }) : setIndex(index + 1)
          }
        >
          {isLast ? '문제 풀러 가기' : '다음 용어'}
        </Button>
      </div>
    </div>
  )
}
