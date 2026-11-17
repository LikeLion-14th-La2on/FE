/**
 * 답 제출 후 해설 (Figma '답 제출 후 해설' / '해설 · 오답')
 * avocado-100(정답) / burnt-orange-100(오답) 카드, 모서리 60, 패딩 50, 간격 25
 * 카드 윗변에 손 올린 다람쥐
 */
import clsx from 'clsx'
import { Link } from 'react-router'

import { Button, PeekSquirrel } from '@/components/common'
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
        'relative flex flex-col gap-2.5 rounded-[24px] p-5',
        correct ? 'bg-avocado-100' : 'bg-burnt-orange-100',
      )}
    >
      <PeekSquirrel right={28} />
      <h2
        className={clsx(
          'text-[20px] leading-[1.4] font-black',
          correct ? 'text-herb' : 'text-burnt-orange-700',
        )}
      >
        {title}
      </h2>
      <p className="text-[14px] leading-[1.4] text-herb">{explanation}</p>
      <p className="text-[11px] leading-[1.4] font-medium text-avocado-400">출처 · {SOURCE}</p>
      <Link
        to={ROUTES.aiTutor(termId)}
        className={clsx(
          'self-start bg-coconut-100 px-3 py-2 text-[13px] leading-[1.4] font-bold text-herb',
          correct ? 'rounded-[12px]' : 'rounded-[24px] shadow-card',
        )}
      >
        {correct ? 'AI 튜터에게 더 물어보기' : '왜 틀렸는지 AI 튜터에게 물어보기'} · 오늘{' '}
        {tutorLeft}회 남음
      </Link>
      {note && (
        <p className="text-[12px] leading-[1.4] font-medium text-burnt-orange-600">{note}</p>
      )}
      <Button onClick={onNext}>{nextLabel}</Button>
    </section>
  )
}
