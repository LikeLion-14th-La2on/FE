/** 답 제출 후 해설: 정답(avocado) / 오답(burnt-orange) */
import clsx from 'clsx'
import { Link } from 'react-router'

import { Button } from '@/components/common'
import { SOURCE } from '@/mocks/learn'
import { ROUTES } from '@/router/routes'

type Props = {
  correct: boolean
  title: string
  explanation: string
  note?: string
  termId: string
  tutorLeft: number
  nextLabel: string
  onNext: () => void
}

export default function ExplanationPanel({
  correct,
  title,
  explanation,
  note,
  termId,
  tutorLeft,
  nextLabel,
  onNext,
}: Props) {
  return (
    <section
      aria-live="polite"
      className={clsx(
        'flex flex-col gap-2.5 rounded-card border px-5 py-5',
        correct
          ? 'border-avocado-200 bg-avocado-100'
          : 'border-burnt-orange-200 bg-burnt-orange-100',
      )}
    >
      <h2 className={clsx('text-title', correct ? 'text-herb' : 'text-burnt-orange-700')}>
        {title}
      </h2>
      <p className="text-body">{explanation}</p>
      <p className="text-tag font-medium text-avocado-400">출처 · {SOURCE}</p>
      {note && <p className="text-sub text-burnt-orange-600">{note}</p>}
      <Link
        to={ROUTES.aiTutor(termId)}
        className="self-start rounded-full bg-coconut-100 px-3.5 py-2 text-sub font-bold text-herb"
      >
        {correct ? 'AI 튜터에게 더 물어보기' : '왜 틀렸는지 AI 튜터에게 물어보기'} · 오늘{' '}
        {tutorLeft}회 남음
      </Link>
      <Button className="mt-1" onClick={onNext}>
        {nextLabel}
      </Button>
    </section>
  )
}
