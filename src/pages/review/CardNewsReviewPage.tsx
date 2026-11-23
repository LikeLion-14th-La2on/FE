/**
 * 카드뉴스 복습: 다시 틀린 문제(복습 안 한 것 전부, 오래된 순)를 학습 전에 카드로 한 번 더 본다.
 * - GET /reviews/today. 카드 제목·설명은 문제에 연결된 첫 번째 용어.
 * - 카드의 그림 자리에는 그 문제 섹터의 다람쥐가 들어간다 (섹터별 캐릭터 제작 전까지는 자리 표시).
 * - 용어 미리보기와 같은 방식으로 넘긴다: 카드 양옆 ‹ ›, 아래 점, 좌우로 밀기.
 * - 카드마다 '다시 풀어보기' → 답을 내면 서버 채점(mode CARD_REVIEW). 맞히면 복습 끝, 또 틀리면 오답노트.
 *   OX·4지선다·상황형은 고르면 바로 채점, 매칭은 짝을 다 지은 뒤 '정답 확인'.
 * - 푼 카드는 결과가 남고 점이 초록이 된다. 모든 카드를 풀면 오늘 학습으로 이어진다.
 */
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { ApiError } from '@/api/client'
import { findTodayStart, submitAnswer, type Graded, type SessionQuestion } from '@/api/learn'
import { getTodayReviews, type ReviewCard } from '@/api/review'
import { Button, LoadError, Loading, PageHeader, PeekSquirrel } from '@/components/common'
import { useApi } from '@/hooks/useApi'
import {
  CIRCLED,
  OX_CLASS,
  SITUATION_PROMPT,
  choicesOf,
  isComplete,
  matchingOf,
  toAnswerValue,
  withIeyo,
  type Answer,
} from '@/pages/learn/quiz/answer'
import ChoiceAnswer from '@/pages/learn/quiz/ChoiceAnswer'
import MatchingAnswer from '@/pages/learn/quiz/MatchingAnswer'
import { ROUTES } from '@/router/routes'

/** 이만큼(px) 이상 밀면 다음/이전 카드로 넘긴다 (용어 미리보기와 같음) */
const SWIPE = 40

const toQuestion = (c: ReviewCard): SessionQuestion => ({ questionId: c.questionId, ...c.question })

/** 결과 안내 문구 */
function resultText(q: SessionQuestion, g: Graded) {
  if (g.correct) return '맞혔어요! 이제 이 문제는 복습 끝이에요.'
  if (q.type === 'OX')
    return `정답은 ${String(g.correctAnswer)}예요. 이 문제는 오답노트에 담아 둘게요.`
  if (q.type === 'MATCHING') return '짝이 틀린 곳이 있어요. 이 문제는 오답노트에 담아 둘게요.'
  const i = Number(g.correctAnswer)
  return `정답은 ${CIRCLED[i]}번 ${withIeyo(choicesOf(q)[i] ?? '')}. 이 문제는 오답노트에 담아 둘게요.`
}

export default function CardNewsReviewPage() {
  const navigate = useNavigate()
  const reviews = useApi(getTodayReviews, 'reviews-today')
  const [index, setIndex] = useState(0)
  /** 카드별 내 답 · 채점 결과 (결과가 있으면 푼 카드) */
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [graded, setGraded] = useState<Record<number, Graded>>({})
  /** 지금 카드에서 '다시 풀어보기'를 눌렀는지 */
  const [solving, setSolving] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const startX = useRef<number | null>(null)

  /** 오늘의 섹터에서 열린 첫 단계로. 일요일이거나 못 찾으면 섹터 선택 화면 */
  const goToday = () => {
    setStarting(true)
    findTodayStart()
      .then((start) =>
        navigate(start ? ROUTES.termPreview(start.sector, start.stepNo) : ROUTES.learn, {
          replace: true,
        }),
      )
      .catch(() => navigate(ROUTES.learn, { replace: true }))
  }

  if (reviews.status === 'loading') return <Loading label="복습할 카드를 준비하고 있어요" />
  if (reviews.status === 'error')
    return <LoadError message={reviews.error.message} onRetry={reviews.reload} />

  const cards = reviews.data.cards

  if (cards.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-gap">
        <PageHeader title="복습" />
        <p className="py-16 text-center text-card-title">복습할 카드가 없어요. 바로 학습해요!</p>
        <Button className="mt-auto" disabled={starting} onClick={goToday}>
          오늘 학습 시작
        </Button>
      </div>
    )
  }

  const card = cards[index]
  const q = toQuestion(card)
  const term = card.terms[0]
  const answer = answers[index] ?? null
  const result = graded[index]
  const solved = result !== undefined
  const allSolved = cards.every((_, i) => graded[i] !== undefined)

  const go = (i: number) => {
    const next = Math.min(Math.max(i, 0), cards.length - 1)
    if (next === index) return
    setIndex(next)
    setSolving(false)
    setSendError(null)
  }

  /** 다음으로 풀 카드: 지금 카드 뒤에서 먼저 찾고, 없으면 앞에서 찾는다 */
  const nextUnsolved = () => {
    const order = [...cards.keys()].map((k) => (index + 1 + k) % cards.length)
    return order.find((i) => graded[i] === undefined) ?? index
  }

  const grade = (a: Answer) => {
    if (sending) return
    const at = index
    setSending(true)
    setSendError(null)
    submitAnswer(q.questionId, toAnswerValue(q, a), 'CARD_REVIEW')
      .then((g) => setGraded((prev) => ({ ...prev, [at]: g })))
      .catch((e) => setSendError(e instanceof ApiError ? e.message : '잠시 후 다시 시도해 주세요'))
      .finally(() => setSending(false))
  }

  /** OX·객관식은 고르면 바로 채점, 매칭은 고르기만 (정답 확인 버튼으로 채점) */
  const choose = (a: Answer) => {
    setAnswers((prev) => ({ ...prev, [index]: a }))
    if (a.kind !== 'matching') grade(a)
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

  const prompt =
    q.type === 'SITUATION' ? SITUATION_PROMPT.replace('\n', ' ') : q.content.replace(/\n/g, ' ')

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
        <h2 className="text-[28px] leading-[1.4] font-black text-herb-400">
          {term?.name ?? '복습 문제'}
        </h2>

        {!solving && !solved ? (
          <>
            <div
              aria-hidden
              className="flex h-[140px] items-center justify-center rounded-[24px] bg-coconut-100 text-[13px] leading-[1.4] font-medium text-avocado-400 shadow-card"
            >
              섹터 다람쥐 자리
            </div>
            {term && <p className="text-[14px] leading-[1.4] text-herb">{term.easyExplanation}</p>}
          </>
        ) : (
          <>
            {q.type === 'SITUATION' && (
              <p className="rounded-[24px] bg-coconut-100 px-4 py-3 text-[14px] leading-[1.4] text-apricot-800">
                {q.content}
              </p>
            )}
            <p className="text-[15px] leading-[1.4] font-bold text-herb">{prompt}</p>

            {q.type === 'OX' && (
              <div className="grid grid-cols-2 gap-3 pb-1">
                {(['O', 'X'] as const).map((v) => {
                  const mine = answer?.kind === 'ox' && answer.value === v
                  return (
                    <button
                      key={v}
                      type="button"
                      disabled={solved || sending}
                      aria-pressed={mine}
                      onClick={() => choose({ kind: 'ox', value: v })}
                      className={clsx(
                        'flex h-20 items-center justify-center rounded-[24px] text-[34px] leading-[1.4] font-black text-coconut-500',
                        'transition-[transform,box-shadow,opacity] duration-75 enabled:active:translate-y-1 enabled:active:shadow-none',
                        OX_CLASS[v],
                        mine && 'translate-y-1 shadow-none',
                        solved && v !== String(result.correctAnswer) && 'opacity-40',
                      )}
                    >
                      {v}
                    </button>
                  )
                })}
              </div>
            )}
            {(q.type === 'MULTIPLE' || q.type === 'SITUATION') && (
              <ChoiceAnswer
                options={choicesOf(q)}
                value={answer?.kind === 'choice' ? answer.value : null}
                answer={solved ? Number(result.correctAnswer) : -1}
                submitted={solved}
                onSelect={(value) => choose({ kind: 'choice', value })}
              />
            )}
            {q.type === 'MATCHING' && (
              <MatchingAnswer
                {...matchingOf(q)}
                links={answer?.kind === 'matching' ? answer.links : {}}
                submitted={solved}
                correctPairs={
                  solved && typeof result.correctAnswer === 'object'
                    ? result.correctAnswer
                    : undefined
                }
                onChange={(links) => choose({ kind: 'matching', links })}
              />
            )}

            {solved && (
              <div
                aria-live="polite"
                className={clsx(
                  'flex flex-col gap-1 rounded-[24px] px-4 py-3 text-[14px] leading-[1.4]',
                  result.correct
                    ? 'bg-avocado-100 text-herb'
                    : 'bg-burnt-orange-100 text-burnt-orange-700',
                )}
              >
                <p className="font-medium">{resultText(q, result)}</p>
                {result.explanation && <p className="text-herb">{result.explanation}</p>}
              </div>
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
            key={c.questionId}
            type="button"
            aria-label={`${i + 1}번째 카드 보기${graded[i] !== undefined ? ' (풀었음)' : ''}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={clsx(
              'size-2 rounded-full',
              i === index
                ? 'bg-burnt-orange-500'
                : graded[i] !== undefined
                  ? 'bg-avocado-500'
                  : 'bg-coconut-600',
            )}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-gap">
        {sendError && (
          <p role="alert" className="text-center text-[13px] leading-[1.4] text-burnt-orange-600">
            {sendError}
          </p>
        )}
        {!solved && (
          <p className="text-center text-[12px] leading-[1.4] font-medium text-avocado-400">
            또 틀리면 오답노트로 이동해요
          </p>
        )}
        {!solved && !solving && <Button onClick={() => setSolving(true)}>다시 풀어보기</Button>}
        {!solved && solving && q.type === 'MATCHING' && (
          <Button
            disabled={!isComplete(q, answer) || sending}
            onClick={() => answer && grade(answer)}
          >
            {sending ? '채점하고 있어요' : '정답 확인'}
          </Button>
        )}
        {!solved && solving && sendError && q.type !== 'MATCHING' && answer && (
          <Button variant="secondary" onClick={() => grade(answer)}>
            다시 채점하기
          </Button>
        )}
        {solved &&
          (allSolved ? (
            <Button disabled={starting} onClick={goToday}>
              오늘 학습 시작
            </Button>
          ) : (
            <Button onClick={() => go(nextUnsolved())}>다음 카드</Button>
          ))}
      </div>
    </div>
  )
}
