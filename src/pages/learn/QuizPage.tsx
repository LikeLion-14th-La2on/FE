/**
 * 문제 풀이 (단계 하나 = 5문제)
 * 1. 5문제를 푼다. 답을 고르기 전엔 정답 확인 비활성, 제출하면 아래에 해설.
 * 2. 틀린 문제는 5문제 뒤에 1번만 다시 낸다.
 * 3. 다시 풀기 결과와 상관없이 단계 완수 → 다시 틀린 문제는 내일 카드뉴스로.
 * 풀다가 나가면 이 단계는 처음부터 (✕나 휴대폰 뒤로가기 → 나가기 확인 시트).
 * 해설에서 AI 튜터로 갔다가 뒤로 오면 풀던 문제(해설 펼친 상태)로 돌아온다.
 * 정답 확인을 누르면 해설과 '다음 문제' 버튼이 보이도록 아래로 스크롤한다.
 */
import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button, QuizTopBar } from '@/components/common'
import { useConfirmBack } from '@/hooks/useConfirmBack'
import { saveReturnSnapshot, useReturnSnapshot } from '@/hooks/useReturnSnapshot'
import { useStageParams } from '@/hooks/useStageParams'
import { getStageContent, type QuizQuestion } from '@/mocks/learn'
import { TUTOR_FREE_PER_DAY } from '@/mocks/tutor'
import { ROUTES } from '@/router/routes'

import {
  CIRCLED,
  TYPE_LABEL,
  isComplete,
  isCorrect,
  type Answer,
  type StageResult,
} from './quiz/answer'
import ChoiceAnswer from './quiz/ChoiceAnswer'
import ExplanationPanel from './quiz/ExplanationPanel'
import MatchingAnswer from './quiz/MatchingAnswer'
import OxAnswer from './quiz/OxAnswer'

/** AI 튜터에 다녀오는 동안 풀이 상태를 잠깐 보관 (돌아오면 바로 지운다) */
type Snapshot = {
  queue: QuizQuestion[]
  retry: boolean
  index: number
  answer: Answer | null
  submitted: boolean
  wrong: QuizQuestion[]
  stillWrong: number
}

const snapshotKey = (sector: string, stage: number) => `quiz-snapshot:${sector}:${stage}`

/** 상황형 질문 문구는 FE에서 고정 (BE는 상황만 보낸다). 레벨 테스트와 같은 문구 */
const SITUATION_PROMPT = '이 상황에 맞는\n개념은?'

function wrongTitle(q: QuizQuestion): string {
  switch (q.type) {
    case 'ox':
      return `아쉬워요, 정답은 ${q.answer}예요`
    case 'choice':
    case 'situation':
      return `아쉬워요, 정답은 ${CIRCLED[q.answer]}번 ${q.options[q.answer]}이에요`
    case 'matching':
      return '아쉬워요, 짝이 틀린 곳이 있어요'
  }
}

export default function QuizPage() {
  const navigate = useNavigate()
  const { sector, stage } = useStageParams()
  const { questions, terms } = useMemo(() => getStageContent(sector), [sector])

  const key = snapshotKey(sector, stage)
  const saved = useReturnSnapshot<Snapshot>(key)

  const [queue, setQueue] = useState<QuizQuestion[]>(saved?.queue ?? questions)
  const [retry, setRetry] = useState(saved?.retry ?? false)
  const [index, setIndex] = useState(saved?.index ?? 0)
  const [answer, setAnswer] = useState<Answer | null>(saved?.answer ?? null)
  const [submitted, setSubmitted] = useState(saved?.submitted ?? false)
  const [wrong, setWrong] = useState<QuizQuestion[]>(saved?.wrong ?? [])
  const [stillWrong, setStillWrong] = useState(saved?.stillWrong ?? 0)
  const [exitOpen, setExitOpen] = useState(false)
  useConfirmBack(() => setExitOpen(true))

  /** 정답 확인 직후 해설이 화면 밖에 있으면 '다음 문제' 버튼까지 보이게 내린다 */
  const panelRef = useRef<HTMLDivElement>(null)
  const [submitTick, setSubmitTick] = useState(0)
  useEffect(() => {
    if (submitTick === 0) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panelRef.current?.scrollIntoView({ block: 'end', behavior: reduce ? 'auto' : 'smooth' })
  }, [submitTick])

  const q = queue[index]
  const correct = submitted && isCorrect(q, answer)
  const isLastInRound = index === queue.length - 1

  const submit = () => {
    setSubmitted(true)
    setSubmitTick((n) => n + 1)
    if (!isCorrect(q, answer)) {
      if (retry) setStillWrong((n) => n + 1)
      else setWrong((list) => [...list, q])
    }
  }

  const saveForTutor = () =>
    saveReturnSnapshot<Snapshot>(key, { queue, retry, index, answer, submitted, wrong, stillWrong })

  const finish = (result: StageResult) =>
    navigate(ROUTES.stageComplete(sector, stage), { replace: true, state: result })

  const next = () => {
    setAnswer(null)
    setSubmitted(false)
    window.scrollTo(0, 0)
    if (!isLastInRound) {
      setIndex(index + 1)
      return
    }
    const firstCorrect = questions.length - wrong.length
    if (!retry && wrong.length > 0) {
      setRetry(true)
      setQueue(wrong)
      setIndex(0)
      return
    }
    finish({
      correct: firstCorrect,
      total: questions.length,
      stillWrong: retry ? stillWrong : 0,
      newTerms: terms.length,
    })
  }

  const nextLabel = !isLastInRound
    ? '다음 문제'
    : !retry && wrong.length > 0
      ? '틀린 문제 다시 풀기'
      : '결과 보기'

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <QuizTopBar
        value={index + 1}
        max={queue.length}
        label={retry ? `다시 ${index + 1}/${queue.length}` : undefined}
        onClose={() => setExitOpen(true)}
      />

      {!submitted && (
        <span
          className={clsx(
            'self-start rounded-full px-3 py-[5px] text-[12px] leading-[1.4] font-bold',
            retry ? 'bg-apricot-100 text-apricot-700' : 'bg-avocado-100 text-herb',
          )}
        >
          {retry ? '틀린 문제 다시 풀기 · 1번만' : TYPE_LABEL[q.type]}
        </span>
      )}

      {q.type === 'situation' && (
        <p className="rounded-[24px] bg-apricot-100 px-4 py-[15px] text-[15px] leading-[1.4] text-apricot-800">
          {q.situation}
        </p>
      )}

      <h1
        className={clsx(
          'leading-[1.4] font-black whitespace-pre-line',
          submitted ? 'text-[18px] text-avocado-400' : 'text-[22px] text-herb',
        )}
      >
        {q.type === 'situation' ? SITUATION_PROMPT : q.prompt}
      </h1>

      <div key={`${retry}-${index}`}>
        {q.type === 'ox' && (
          <OxAnswer
            value={answer?.kind === 'ox' ? answer.value : null}
            answer={q.answer}
            submitted={submitted}
            onSelect={(value) => setAnswer({ kind: 'ox', value })}
          />
        )}
        {(q.type === 'choice' || q.type === 'situation') && (
          <ChoiceAnswer
            options={q.options}
            value={answer?.kind === 'choice' ? answer.value : null}
            answer={q.answer}
            submitted={submitted}
            onSelect={(value) => setAnswer({ kind: 'choice', value })}
          />
        )}
        {q.type === 'matching' && (
          <MatchingAnswer
            question={q}
            links={answer?.kind === 'matching' ? answer.links : {}}
            submitted={submitted}
            onChange={(links) => setAnswer({ kind: 'matching', links })}
          />
        )}
        {retry && !submitted && (
          <p className="mt-gap text-[12px] leading-[1.4] text-avocado-400">
            이번에 틀려도 괜찮아요. 내일 카드뉴스로 한 번 더 보여드릴게요
          </p>
        )}
      </div>

      <div ref={panelRef} className={clsx('mt-auto', submitted && 'pt-16')}>
        {submitted ? (
          <ExplanationPanel
            correct={correct}
            title={correct ? '정답이에요!' : wrongTitle(q)}
            explanation={q.explanation}
            note={
              correct
                ? undefined
                : retry
                  ? '괜찮아요. 내일 카드뉴스로 한 번 더 보여드릴게요'
                  : '이 문제는 5문제를 다 푼 뒤 한 번 더 나와요'
            }
            termId={q.termId}
            tutorLeft={TUTOR_FREE_PER_DAY}
            nextLabel={nextLabel}
            onNext={next}
            onTutor={saveForTutor}
          />
        ) : (
          <Button disabled={!isComplete(q, answer)} onClick={submit}>
            정답 확인
          </Button>
        )}
      </div>

      <BottomSheet
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        labelledBy="quiz-exit-title"
        peek
      >
        <h2 id="quiz-exit-title" className="text-[20px] leading-[1.4] font-black text-herb">
          학습을 그만둘까요?
        </h2>
        <p className="text-[14px] leading-[1.5] text-herb">
          지금 나가면 이 단계는 처음부터 다시 풀어야 해요. 푼 문제는 저장되지 않아요.
        </p>
        <Button onClick={() => setExitOpen(false)}>계속 풀기</Button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.home, { replace: true })}
          className="h-btn text-[16px] leading-[1.4] font-bold text-avocado-400"
        >
          나가기
        </button>
      </BottomSheet>
    </div>
  )
}
