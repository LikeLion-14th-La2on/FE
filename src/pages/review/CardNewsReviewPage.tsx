/**
 * 카드뉴스 복습: 다시 틀린 문제(복습 안 한 것 전부, 오래된 순)를 학습 전에 카드로 한 번 더 본다.
 * 카드의 그림 자리에는 그 문제 섹터의 다람쥐가 들어간다 (섹터별 캐릭터 제작 전까지는 자리 표시).
 * - 용어 미리보기와 같은 방식으로 넘긴다: 카드 양옆 ‹ ›, 아래 점, 좌우로 밀기.
 * - 카드마다 '다시 풀어보기' → 맞히면 끝, 또 틀리면 오답노트로 간다. 푼 카드는 결과가 남고 점이 초록이 된다.
 * - 모든 카드를 풀면 오늘 학습으로 이어진다.
 */
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Button, PageHeader, PeekSquirrel } from '@/components/common'
import { TODAY } from '@/mocks/learn'
import { YESTERDAY_REVIEW } from '@/mocks/review'
import { OX_CLASS } from '@/pages/learn/quiz/answer'
import { ROUTES } from '@/router/routes'

/** 이만큼(px) 이상 밀면 다음/이전 카드로 넘긴다 (용어 미리보기와 같음) */
const SWIPE = 40

export default function CardNewsReviewPage() {
  const navigate = useNavigate()
  const cards = YESTERDAY_REVIEW
  const [index, setIndex] = useState(0)
  /** 카드별로 고른 답 (있으면 푼 카드) */
  const [picked, setPicked] = useState<Record<number, 'O' | 'X'>>({})
  /** 지금 카드에서 '다시 풀어보기'를 눌렀는지 */
  const [solving, setSolving] = useState(false)
  const startX = useRef<number | null>(null)

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
  const mine = picked[index]
  const solved = mine !== undefined
  const correct = mine === card.answer
  const allSolved = cards.every((_, i) => picked[i] !== undefined)

  const go = (i: number) => {
    const next = Math.min(Math.max(i, 0), cards.length - 1)
    if (next === index) return
    setIndex(next)
    setSolving(false)
  }

  /** 다음으로 풀 카드: 지금 카드 뒤에서 먼저 찾고, 없으면 앞에서 찾는다 */
  const nextUnsolved = () => {
    const order = [...cards.keys()].map((k) => (index + 1 + k) % cards.length)
    return order.find((i) => picked[i] === undefined) ?? index
  }

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
      <PageHeader title="복습" />

      <div className="flex items-end justify-between gap-2">
        <h1 className="text-[20px] leading-[1.4] font-black text-herb">
          틀린 문제를
          <br />
          카드로 한 번 더 봐요
        </h1>
        <span className="text-[13px] leading-[1.4] font-bold text-avocado-400">
          {index + 1} / {cards.length}
        </span>
      </div>

      <article
        aria-roledescription="카드"
        aria-label={`${index + 1}번째 카드`}
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => swipeEnd(e.clientX)}
        onPointerCancel={() => (startX.current = null)}
        className="relative flex touch-pan-y flex-col gap-3 rounded-[24px] bg-apricot-100 p-[22px] select-none"
      >
        <PeekSquirrel right={92} />
        <h2 className="text-[28px] leading-[1.4] font-black text-herb-400">{card.title}</h2>

        {!solving && !solved ? (
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
                  disabled={solved}
                  aria-pressed={mine === v}
                  onClick={() => setPicked({ ...picked, [index]: v })}
                  className={clsx(
                    'flex h-20 items-center justify-center rounded-[24px] text-[34px] leading-[1.4] font-black text-coconut-500',
                    'transition-[transform,box-shadow,opacity] duration-75 enabled:active:translate-y-1 enabled:active:shadow-none',
                    OX_CLASS[v],
                    mine === v && 'translate-y-1 shadow-none',
                    solved && v !== card.answer && 'opacity-40',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            {solved && (
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

        {index > 0 && (
          <button
            type="button"
            aria-label="이전 카드로"
            onClick={() => go(index - 1)}
            className={clsx(arrow, 'left-1')}
          >
            ‹
          </button>
        )}
        {index < cards.length - 1 && (
          <button
            type="button"
            aria-label="다음 카드로"
            onClick={() => go(index + 1)}
            className={clsx(arrow, 'right-1')}
          >
            ›
          </button>
        )}
      </article>

      <div className="flex justify-center gap-1.5">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`${i + 1}번째 카드 보기${picked[i] !== undefined ? ' (풀었음)' : ''}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={clsx(
              'size-2 rounded-full',
              i === index
                ? 'bg-burnt-orange-500'
                : picked[i] !== undefined
                  ? 'bg-avocado-500'
                  : 'bg-coconut-600',
            )}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-gap">
        {!solved && (
          <p className="text-center text-[12px] leading-[1.4] font-medium text-avocado-400">
            또 틀리면 오답노트로 이동해요
          </p>
        )}
        {!solved && !solving && <Button onClick={() => setSolving(true)}>다시 풀어보기</Button>}
        {solved &&
          (allSolved ? (
            <Button onClick={goToday}>오늘 학습 시작</Button>
          ) : (
            <Button onClick={() => go(nextUnsolved())}>다음 카드</Button>
          ))}
      </div>
    </div>
  )
}
