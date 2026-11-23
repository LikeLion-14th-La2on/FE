/**
 * 오늘의 시사 퀴즈 카드 (뉴스 탭, 홈 등 어디에 두어도 되게 카드 하나로 만든다)
 * - GET /news-quizzes/today. 오늘 게시분이 없으면 가장 최근 것, 하나도 없으면 '아직 없어요'
 * - 카드뉴스 복습처럼 OX · 4지선다 · 상황형은 고르면 바로 채점
 * - 채점만 하고 기록은 안 남는다. 다시 들어와도 결과가 보이게 푼 결과는 이 기기에 둔다
 */
import clsx from 'clsx'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import {
  getTodayNewsQuiz,
  submitNewsQuiz,
  type NewsQuiz,
  type NewsQuizResult,
} from '@/api/newsQuiz'
import { LoadError } from '@/components/common'
import { useApi } from '@/hooks/useApi'
import {
  CIRCLED,
  OX_CLASS,
  SITUATION_PROMPT,
  TYPE_LABEL,
  withIeyo,
} from '@/pages/learn/quiz/answer'
import ChoiceAnswer from '@/pages/learn/quiz/ChoiceAnswer'

/** 푼 결과 (퀴즈가 바뀌면 안 쓴다) */
type Solved = { quizId: number; answer: string; result: NewsQuizResult }
const SOLVED_KEY = 'news-quiz-solved'

function loadSolved(quizId: number): Solved | null {
  try {
    const saved = JSON.parse(localStorage.getItem(SOLVED_KEY) ?? 'null') as Solved | null
    return saved?.quizId === quizId ? saved : null
  } catch {
    return null
  }
}

function saveSolved(solved: Solved) {
  try {
    localStorage.setItem(SOLVED_KEY, JSON.stringify(solved))
  } catch {
    // 저장 못 해도 지금 화면에서는 결과가 보인다
  }
}

/** 2026-11-23 → 11월 23일 */
function dateLabel(date: string) {
  const [, m, d] = date.split('-').map(Number)
  return m && d ? `${m}월 ${d}일` : date
}

export default function NewsQuizCard() {
  const quiz = useApi(getTodayNewsQuiz, 'news-quiz-today')

  if (quiz.status === 'loading') {
    return (
      <section className="flex h-[180px] items-center justify-center rounded-[24px] bg-apricot-100 text-[13px] leading-[1.4] text-avocado-400">
        시사 퀴즈를 불러오고 있어요 · · ·
      </section>
    )
  }
  if (quiz.status === 'error') {
    if (quiz.error.status === 404) {
      return (
        <section className="flex flex-col items-center gap-1.5 rounded-[24px] bg-apricot-100 px-4 py-8 text-center">
          <p className="text-[16px] leading-[1.4] font-bold text-herb">
            아직 등록된 시사 퀴즈가 없어요
          </p>
          <p className="text-[13px] leading-[1.4] text-avocado-400">매주 새 퀴즈가 올라와요</p>
        </section>
      )
    }
    return <LoadError message={quiz.error.message} onRetry={quiz.reload} />
  }
  // 퀴즈가 바뀌면 처음부터 풀도록 key로 새로 그린다
  return <QuizBody key={quiz.data.quizId} quiz={quiz.data} />
}

function QuizBody({ quiz }: { quiz: NewsQuiz }) {
  const q = quiz.question
  const [solved, setSolved] = useState<Solved | null>(() => loadSolved(quiz.quizId))
  const [picked, setPicked] = useState<string | null>(solved?.answer ?? null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const result = solved?.result

  const choose = (answer: string) => {
    if (solved || sending) return
    setPicked(answer)
    setSending(true)
    setSendError(null)
    submitNewsQuiz(quiz.quizId, answer).then(
      (res) => {
        const next = { quizId: quiz.quizId, answer, result: res }
        saveSolved(next)
        setSolved(next)
        setSending(false)
      },
      (e: unknown) => {
        setSendError(e instanceof ApiError ? e.message : '잠시 후 다시 시도해 주세요')
        setSending(false)
      },
    )
  }

  const choices = q.choices ?? []
  const resultText = !result
    ? ''
    : result.correct
      ? '정답이에요! 뉴스를 제대로 읽었네요.'
      : q.type === 'OX'
        ? `아쉬워요, 정답은 ${result.correctAnswer}예요.`
        : `아쉬워요, 정답은 ${CIRCLED[Number(result.correctAnswer)] ?? ''}번 ${withIeyo(choices[Number(result.correctAnswer)] ?? '')}.`

  return (
    <section className="flex flex-col gap-3 rounded-[24px] bg-apricot-100 p-[22px]">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-apricot-600 px-3 py-[5px] text-[12px] leading-[1.4] font-bold text-coconut-500">
          오늘의 시사 퀴즈
        </span>
        <span className="text-[12px] leading-[1.4] font-medium text-apricot-700">
          {dateLabel(quiz.publishDate)} · {TYPE_LABEL[q.type]}
        </span>
      </div>

      {q.type === 'SITUATION' ? (
        <>
          <p className="rounded-[24px] bg-coconut-100 px-4 py-3 text-[14px] leading-[1.5] text-apricot-800">
            {q.content}
          </p>
          <p className="text-[17px] leading-[1.4] font-bold text-herb">
            {SITUATION_PROMPT.replace('\n', ' ')}
          </p>
        </>
      ) : (
        <p className="text-[17px] leading-[1.4] font-bold whitespace-pre-line text-herb">
          {q.content}
        </p>
      )}

      {q.type === 'OX' ? (
        <div className="grid grid-cols-2 gap-3 pb-1">
          {(['O', 'X'] as const).map((v) => {
            const mine = picked === v
            return (
              <button
                key={v}
                type="button"
                disabled={!!solved || sending}
                aria-pressed={mine}
                onClick={() => choose(v)}
                className={clsx(
                  'flex h-20 items-center justify-center rounded-[24px] text-[34px] leading-[1.4] font-black text-coconut-500',
                  'transition-[transform,box-shadow,opacity] duration-75 enabled:active:translate-y-1 enabled:active:shadow-none',
                  OX_CLASS[v],
                  mine && 'translate-y-1 shadow-none',
                  result && v !== result.correctAnswer && 'opacity-40',
                )}
              >
                {v}
              </button>
            )
          })}
        </div>
      ) : (
        <ChoiceAnswer
          options={choices}
          value={picked === null ? null : Number(picked)}
          answer={result ? Number(result.correctAnswer) : -1}
          submitted={!!result}
          onSelect={(i) => choose(String(i))}
        />
      )}

      {sending && (
        <p role="status" className="text-[13px] leading-[1.4] text-avocado-400">
          채점하고 있어요 · · ·
        </p>
      )}
      {sendError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 rounded-[24px] bg-burnt-orange-100 px-4 py-3 text-[13px] leading-[1.4] text-burnt-orange-700"
        >
          {sendError}
          <button
            type="button"
            onClick={() => picked !== null && choose(picked)}
            className="shrink-0 rounded-full bg-apricot-600 px-3 py-1.5 text-[12px] leading-[1.4] font-bold text-coconut-300"
          >
            다시 채점하기
          </button>
        </div>
      )}

      {result && (
        <div
          aria-live="polite"
          className={clsx(
            'flex flex-col gap-1 rounded-[24px] px-4 py-3 text-[14px] leading-[1.4]',
            result.correct
              ? 'bg-avocado-100 text-herb'
              : 'bg-burnt-orange-100 text-burnt-orange-700',
          )}
        >
          <p className="font-medium">{resultText}</p>
          {result.explanation && <p className="text-herb">{result.explanation}</p>}
        </div>
      )}
      {result && (
        <p className="text-[12px] leading-[1.4] text-avocado-400">
          시사 퀴즈는 오답노트에 담기지 않아요 · 다음 퀴즈도 기대해 주세요
        </p>
      )}
    </section>
  )
}
