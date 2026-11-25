/**
 * 답 제출 후 해설 (Figma '답 제출 후 해설' / '해설 · 오답' / '해설 · AI 튜터 용어 고르기')
 * avocado-100(정답) / burnt-orange-100(오답) 카드, 모서리 60, 패딩 50, 간격 25
 * 카드 윗변에 손 올린 다람쥐
 * - AI 튜터 버튼: 문제에 연결된 용어가 1개면 바로 그 용어로, 2개 이상이면 바텀시트에서 고른다.
 */
import clsx from 'clsx'
import { useState } from 'react'
import { Link } from 'react-router'

import { BottomSheet, Button, PeekSquirrel } from '@/components/common'
import { ROUTES } from '@/router/routes'

import ReportQuestion from './ReportQuestion'

export type TutorTerm = { termId: number; name: string; easyExplanation?: string }

type Props = {
  correct: boolean
  title: string
  explanation: string
  reference: string
  note?: string
  /** 이 문제에 연결된 용어 (AI 튜터로 이어짐) */
  terms: TutorTerm[]
  /** 오늘 남은 무료 질문 수 (모르면 표시하지 않음) */
  tutorLeft?: number
  nextLabel: string
  onNext: () => void
  /** AI 튜터로 넘어가기 직전 (돌아왔을 때 이어서 풀 수 있게 저장) */
  onTutor?: () => void
  /** 있으면 '문제 신고' 버튼을 보여 준다 */
  questionId?: number
}

export default function ExplanationPanel({
  correct,
  title,
  explanation,
  reference,
  note,
  terms,
  tutorLeft,
  nextLabel,
  onNext,
  onTutor,
  questionId,
}: Props) {
  const [pickOpen, setPickOpen] = useState(false)

  const tutorClass = clsx(
    'self-start bg-coconut-100 px-3 py-2 text-left text-[13px] leading-[1.4] font-bold text-herb',
    correct ? 'rounded-[12px]' : 'rounded-[24px] shadow-card',
  )
  const tutorLabel = (
    <>
      {correct ? 'AI 튜터에게 더 물어보기' : '왜 틀렸는지 AI 튜터에게 물어보기'}
      {tutorLeft !== undefined && ` · 오늘 ${tutorLeft}회 남음`}
    </>
  )

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
      {reference && (
        <p className="text-[11px] leading-[1.4] font-medium text-avocado-400">출처 · {reference}</p>
      )}

      {terms.length === 1 && (
        <Link to={ROUTES.aiTutor(String(terms[0].termId))} onClick={onTutor} className={tutorClass}>
          {tutorLabel}
        </Link>
      )}
      {terms.length > 1 && (
        <button type="button" onClick={() => setPickOpen(true)} className={tutorClass}>
          {tutorLabel}
        </button>
      )}

      {note && (
        <p className="text-[12px] leading-[1.4] font-medium text-burnt-orange-600">{note}</p>
      )}
      <Button onClick={onNext}>{nextLabel}</Button>
      {questionId !== undefined && <ReportQuestion questionId={questionId} />}

      <BottomSheet
        open={pickOpen}
        onClose={() => setPickOpen(false)}
        labelledBy="tutor-pick-title"
        peek
      >
        <h2 id="tutor-pick-title" className="text-[20px] leading-[1.4] font-black text-herb">
          어떤 용어를 물어볼까요?
        </h2>
        <p className="text-[14px] leading-[1.5] text-herb">
          이 문제에 나온 용어예요. 하나를 고르면 AI 튜터로 이어져요.
        </p>
        <ul className="flex flex-col gap-2">
          {terms.map((t) => (
            <li key={t.termId}>
              <Link
                to={ROUTES.aiTutor(String(t.termId))}
                onClick={onTutor}
                className="flex items-center justify-between gap-3 rounded-[24px] bg-coconut-100 px-4 py-[13px] text-[15px] leading-[1.4] text-herb shadow-card"
              >
                <span className="min-w-0">
                  <b className="font-bold">{t.name}</b>
                  {t.easyExplanation && <span> · {t.easyExplanation}</span>}
                </span>
                <span aria-hidden className="text-[20px] font-bold text-apricot-600">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setPickOpen(false)}
          className="h-btn text-[16px] leading-[1.4] font-bold text-avocado-400"
        >
          닫기
        </button>
      </BottomSheet>
    </section>
  )
}
