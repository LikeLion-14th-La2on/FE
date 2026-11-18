/**
 * 카드뉴스 복습: 다시 틀린 문제(복습 안 한 것 전부, 오래된 순)를 학습 전에 카드로 한 번 더 본다.
 * 카드의 그림 자리에는 그 문제 섹터의 다람쥐가 들어간다 (섹터별 캐릭터 제작 전까지는 자리 표시).
 * 카드를 읽고 '다시 풀어보기' → 맞히면 끝, 또 틀리면 오답노트로 간다.
 * 마지막 카드 뒤에는 오늘 학습으로 이어진다.
 */
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button, PageHeader, PeekSquirrel } from '@/components/common'
import { TODAY } from '@/mocks/learn'
import { YESTERDAY_REVIEW } from '@/mocks/review'
import { OX_CLASS } from '@/pages/learn/quiz/answer'
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
        <PageHeader title="복습" />
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
      <PageHeader title="복습" />

      <h1 className="text-[20px] leading-[1.4] font-black text-herb">
        틀린 문제를
        <br />
        카드로 한 번 더 봐요
      </h1>

      <article className="relative flex flex-col gap-3 rounded-[24px] bg-apricot-100 p-[22px]">
        <PeekSquirrel right={28} />
        <span className="self-start rounded-full bg-coconut-100 px-3 py-[5px] text-[12px] leading-[1.4] font-bold text-herb-400">
          카드 {index + 1} / {cards.length}
        </span>
        <h2 className="text-[28px] leading-[1.4] font-black text-herb-400">{card.title}</h2>

        {step === 'read' ? (
          <>
            <div
              aria-hidden
              className="flex h-[140px] items-center justify-center rounded-[24px] bg-coconut-100 text-[13px] leading-[1.4] font-medium text-avocado-400 shadow-card"
            >
              섹터 다람쥐 자리
            </div>
            <p className="text-[14px] leading-[1.4] text-herb">{card.body}</p>
          </>
        ) : (
          <>
            <p className="text-[15px] leading-[1.4] font-bold text-herb">{card.prompt}</p>
            <div className="grid grid-cols-2 gap-3 pb-1">
              {(['O', 'X'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={step === 'result'}
                  aria-pressed={picked === v}
                  onClick={() => {
                    setPicked(v)
                    setStep('result')
                  }}
                  className={clsx(
                    'flex h-20 items-center justify-center rounded-[24px] text-[34px] leading-[1.4] font-black text-coconut-500',
                    'transition-[transform,box-shadow,opacity] duration-75 enabled:active:translate-y-1 enabled:active:shadow-none',
                    OX_CLASS[v],
                    picked === v && 'translate-y-1 shadow-none',
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
                  'rounded-[24px] px-4 py-3 text-[14px] leading-[1.4] font-medium',
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

      <div className="mt-auto flex flex-col gap-gap">
        <p className="text-center text-[12px] leading-[1.4] font-medium text-avocado-400">
          또 틀리면 오답노트로 이동해요
        </p>
        {step === 'read' && <Button onClick={() => setStep('solve')}>다시 풀어보기</Button>}
        {step === 'result' && (
          <Button onClick={nextCard}>{isLast ? '오늘 학습 시작' : '다음 카드'}</Button>
        )}
      </div>
    </div>
  )
}
