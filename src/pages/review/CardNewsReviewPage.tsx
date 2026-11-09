/**
 * 카드뉴스 복습: 어제 다시 틀린 문제를 오늘 학습 전에 카드로 한 번 더 본다.
 * 카드를 읽고 '다시 풀어보기' → 맞히면 끝, 또 틀리면 오답노트로 간다.
 * 마지막 카드 뒤에는 오늘 학습으로 이어진다.
 */
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button, PageHeader, SectorChip } from '@/components/common'
import { TODAY } from '@/mocks/learn'
import { YESTERDAY_REVIEW } from '@/mocks/review'
import { ROUTES } from '@/router/routes'

type Step = 'read' | 'solve' | 'result'

export default function CardNewsReviewPage() {
  const navigate = useNavigate()
  const cards = YESTERDAY_REVIEW
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState<Step>('read')
  const [picked, setPicked] = useState<'O' | 'X' | null>(null)

  const goToday = () => navigate(ROUTES.termPreview(TODAY.sector, TODAY.stage), { replace: true })

  if (cards.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-gap">
        <PageHeader title="어제 복습" />
        <p className="py-16 text-center text-card-title">복습할 카드가 없어요. 바로 학습해요!</p>
        <Button className="mt-auto" onClick={goToday}>
          오늘 학습 시작
        </Button>
      </div>
    )
  }

  const card = cards[index]
  const isLast = index === cards.length - 1
  const correct = picked === card.answer

  const nextCard = () => {
    if (isLast) return goToday()
    setIndex(index + 1)
    setStep('read')
    setPicked(null)
  }

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title="어제 복습" />

      <div className="flex items-center justify-between">
        <h1 className="text-card-title">어제 다시 틀린 문제를 카드로 한 번 더 봐요</h1>
        <span className="shrink-0 text-sub text-avocado-400">
          카드 {index + 1} / {cards.length}
        </span>
      </div>

      <article className="flex flex-col gap-4 rounded-card bg-apricot-100 px-6 py-6 shadow-card">
        <SectorChip sector={card.sector} className="self-start" />
        <h2 className="text-[26px] leading-tight font-black">{card.title}</h2>

        {step === 'read' ? (
          <>
            <div
              aria-hidden
              className="flex h-40 items-center justify-center rounded-option bg-coconut-100 text-sub text-avocado-300"
            >
              그림 · 도식 자리
            </div>
            <p className="text-body">{card.body}</p>
          </>
        ) : (
          <>
            <p className="text-card-title">{card.prompt}</p>
            <div className="grid grid-cols-2 gap-3">
              {(['O', 'X'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={step === 'result'}
                  onClick={() => {
                    setPicked(v)
                    setStep('result')
                  }}
                  className={clsx(
                    'flex h-20 items-center justify-center rounded-card text-[34px] font-black text-coconut-100',
                    v === 'O'
                      ? 'bg-avocado-500 shadow-[0_4px_0_var(--color-avocado-700)]'
                      : 'bg-burnt-orange-500 shadow-[0_4px_0_var(--color-burnt-orange-700)]',
                    step === 'result' && v !== card.answer && 'opacity-40',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            {step === 'result' && (
              <p
                aria-live="polite"
                className={clsx(
                  'rounded-option px-4 py-3 text-body font-medium',
                  correct
                    ? 'bg-avocado-100 text-herb'
                    : 'bg-burnt-orange-100 text-burnt-orange-700',
                )}
              >
                {correct
                  ? '맞혔어요! 이제 이 문제는 복습 끝이에요.'
                  : `정답은 ${card.answer}예요. 이 문제는 오답노트에 담아 둘게요.`}
              </p>
            )}
          </>
        )}
      </article>

      <p className="text-sub text-avocado-400">또 틀리면 오답노트로 이동해요</p>

      <div className="mt-auto">
        {step === 'read' && <Button onClick={() => setStep('solve')}>다시 풀어보기</Button>}
        {step === 'result' && (
          <Button onClick={nextCard}>{isLast ? '오늘 학습 시작' : '다음 카드'}</Button>
        )}
      </div>
    </div>
  )
}
