/**
 * 문제 풀이 (단계 하나 = 5문제, 학습 세션 API)
 * 1. 5문제를 푼다. 답을 고르기 전엔 정답 확인 비활성, 누르면 서버 채점(POST /questions/{id}/answer) → 아래에 해설.
 * 2. 틀린 문제는 5문제 뒤에 1번만 다시 낸다 (mode RETRY, 또 틀리면 서버가 내일 카드뉴스로 저장).
 * 3. 다시 풀기 결과와 상관없이 단계 완수(POST /stages/{id}/complete) → 결과 화면.
 * 풀다가 나가면 이 단계는 처음부터 (✕나 휴대폰 뒤로가기 → 나가기 확인 시트).
 * 해설에서 AI 튜터로 갔다가 뒤로 오면 풀던 문제(해설 펼친 상태)로 돌아온다.
 * 정답 확인을 누르면 해설과 '다음 문제' 버튼이 보이도록 아래로 스크롤한다.
 */
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { ApiError } from '@/api/client'
import {
  completeStage,
  submitAnswer,
  type Graded,
  type Session,
  type SessionQuestion,
} from '@/api/learn'
import { BottomSheet, Button, LoadError, Loading, QuizTopBar } from '@/components/common'
import type { Sector } from '@/constants/sectors'
import { useConfirmBack } from '@/hooks/useConfirmBack'
import { saveReturnSnapshot, useReturnSnapshot } from '@/hooks/useReturnSnapshot'
import { useStageParams } from '@/hooks/useStageParams'
import { useStageSession } from '@/hooks/useStageSession'
import { ROUTES } from '@/router/routes'

import {
  SITUATION_PROMPT,
  TYPE_LABEL,
  choicesOf,
  isComplete,
  matchingOf,
  toAnswerValue,
  wrongTitle,
  type Answer,
} from './quiz/answer'
import ChoiceAnswer from './quiz/ChoiceAnswer'
import ExplanationPanel, { type TutorTerm } from './quiz/ExplanationPanel'
import MatchingAnswer from './quiz/MatchingAnswer'
import OxAnswer from './quiz/OxAnswer'
import SessionError from './SessionError'
import type { StageCompleteState } from './StageCompletePage'

/** AI 튜터에 다녀오는 동안 풀이 상태를 잠깐 보관 (돌아오면 바로 지운다) */
type Snapshot = {
  queue: SessionQuestion[]
  retry: boolean
  index: number
  answer: Answer | null
  graded: Graded | null
  wrong: SessionQuestion[]
  firstCorrect: number
  stillWrong: number
}

const snapshotKey = (sector: string, stage: number) => `quiz-snapshot:${sector}:${stage}`

const MATCHING_PROMPT = '용어와 뜻을\n짝지어 보세요'

export default function QuizPage() {
  const { sector, stage } = useStageParams()
  const session = useStageSession(sector, stage)

  if (session.status === 'loading') return <Loading label="문제를 준비하고 있어요" />
  if (session.status === 'error')
    return <SessionError error={session.error} onRetry={session.reload} />
  if (session.data.questions.length === 0)
    return <LoadError message="이 단계 문제를 준비하고 있어요" />
  return <QuizRun key={`${sector}:${stage}`} session={session.data} sector={sector} stage={stage} />
}

function QuizRun({ session, sector, stage }: { session: Session; sector: Sector; stage: number }) {
  const navigate = useNavigate()
  const questions = session.questions

  const key = snapshotKey(sector, stage)
  const saved = useReturnSnapshot<Snapshot>(key)

  const [queue, setQueue] = useState<SessionQuestion[]>(saved?.queue ?? questions)
  const [retry, setRetry] = useState(saved?.retry ?? false)
  const [index, setIndex] = useState(saved?.index ?? 0)
  const [answer, setAnswer] = useState<Answer | null>(saved?.answer ?? null)
  const [graded, setGraded] = useState<Graded | null>(saved?.graded ?? null)
  const [wrong, setWrong] = useState<SessionQuestion[]>(saved?.wrong ?? [])
  const [firstCorrect, setFirstCorrect] = useState(saved?.firstCorrect ?? 0)
  const [stillWrong, setStillWrong] = useState(saved?.stillWrong ?? 0)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)
  const [exitOpen, setExitOpen] = useState(false)
  useConfirmBack(() => setExitOpen(true), !finishing)

  /** 정답 확인 직후 해설이 화면 밖에 있으면 '다음 문제' 버튼까지 보이게 내린다 */
  const panelRef = useRef<HTMLDivElement>(null)
  const [submitTick, setSubmitTick] = useState(0)
  useEffect(() => {
    if (submitTick === 0) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panelRef.current?.scrollIntoView({ block: 'end', behavior: reduce ? 'auto' : 'smooth' })
  }, [submitTick])

  const q = queue[index]
  const submitted = graded !== null
  const isLastInRound = index === queue.length - 1
  const termById = new Map(session.terms.map((t) => [t.termId, t]))
  const tutorTerms: TutorTerm[] = q.termIds.map(
    (id) => termById.get(id) ?? { termId: id, name: '이 용어' },
  )

  const message = (e: unknown) => (e instanceof ApiError ? e.message : '잠시 후 다시 시도해 주세요')

  const submit = () => {
    if (!answer || sending) return
    setSending(true)
    setSendError(null)
    submitAnswer(q.questionId, toAnswerValue(q, answer), retry ? 'RETRY' : 'LEARNING')
      .then((result) => {
        setGraded(result)
        setSubmitTick((n) => n + 1)
        if (retry) {
          if (!result.correct) setStillWrong((n) => n + 1)
        } else if (result.correct) setFirstCorrect((n) => n + 1)
        else setWrong((list) => [...list, q])
      })
      .catch((e) => setSendError(message(e)))
      .finally(() => setSending(false))
  }

  const saveForTutor = () =>
    saveReturnSnapshot<Snapshot>(key, {
      queue,
      retry,
      index,
      answer,
      graded,
      wrong,
      firstCorrect,
      stillWrong,
    })

  const finish = () => {
    setFinishing(true)
    setFinishError(null)
    completeStage(session.stageId, firstCorrect)
      .then((result) => {
        const state: StageCompleteState = {
          result,
          correct: firstCorrect,
          total: questions.length,
          stillWrong: retry ? stillWrong : 0,
        }
        navigate(ROUTES.stageComplete(sector, stage), { replace: true, state })
      })
      .catch((e) => {
        setFinishError(message(e))
        setFinishing(false)
      })
  }

  const next = () => {
    if (!isLastInRound) {
      setAnswer(null)
      setGraded(null)
      window.scrollTo(0, 0)
      setIndex(index + 1)
      return
    }
    if (!retry && wrong.length > 0) {
      setAnswer(null)
      setGraded(null)
      window.scrollTo(0, 0)
      setRetry(true)
      setQueue(wrong)
      setIndex(0)
      return
    }
    finish()
  }

  if (finishError) return <LoadError message={finishError} onRetry={finish} />
  if (finishing) return <Loading label="결과를 정리하고 있어요" />

  const nextLabel = !isLastInRound
    ? '다음 문제'
    : !retry && wrong.length > 0
      ? '틀린 문제 다시 풀기'
      : '결과 보기'

  const prompt =
    q.type === 'SITUATION'
      ? SITUATION_PROMPT
      : q.type === 'MATCHING'
        ? q.content || MATCHING_PROMPT
        : q.content

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

      {q.type === 'SITUATION' && (
        <p className="rounded-[24px] bg-apricot-100 px-4 py-[15px] text-[15px] leading-[1.4] text-apricot-800">
          {q.content}
        </p>
      )}

      <h1
        className={clsx(
          'leading-[1.4] font-black whitespace-pre-line',
          submitted ? 'text-[18px] text-avocado-400' : 'text-[22px] text-herb',
        )}
      >
        {prompt}
      </h1>

      <div key={`${retry}-${index}`}>
        {q.type === 'OX' && (
          <OxAnswer
            value={answer?.kind === 'ox' ? answer.value : null}
            answer={graded ? (String(graded.correctAnswer) as 'O' | 'X') : undefined}
            submitted={submitted}
            onSelect={(value) => setAnswer({ kind: 'ox', value })}
          />
        )}
        {(q.type === 'MULTIPLE' || q.type === 'SITUATION') && (
          <ChoiceAnswer
            options={choicesOf(q)}
            value={answer?.kind === 'choice' ? answer.value : null}
            answer={graded ? Number(graded.correctAnswer) : -1}
            submitted={submitted}
            onSelect={(value) => setAnswer({ kind: 'choice', value })}
          />
        )}
        {q.type === 'MATCHING' && (
          <MatchingAnswer
            {...matchingOf(q)}
            links={answer?.kind === 'matching' ? answer.links : {}}
            submitted={submitted}
            correctPairs={
              graded && typeof graded.correctAnswer === 'object' ? graded.correctAnswer : undefined
            }
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
        {graded ? (
          <ExplanationPanel
            correct={graded.correct}
            title={graded.correct ? '정답이에요!' : wrongTitle(q, graded.correctAnswer)}
            explanation={graded.explanation}
            reference={graded.reference}
            note={
              graded.correct
                ? undefined
                : retry
                  ? '괜찮아요. 내일 카드뉴스로 한 번 더 보여드릴게요'
                  : '이 문제는 5문제를 다 푼 뒤 한 번 더 나와요'
            }
            terms={tutorTerms}
            nextLabel={nextLabel}
            onNext={next}
            onTutor={saveForTutor}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {sendError && (
              <p
                role="alert"
                className="text-center text-[13px] leading-[1.4] text-burnt-orange-600"
              >
                {sendError}
              </p>
            )}
            <Button disabled={!isComplete(q, answer) || sending} onClick={submit}>
              {sending ? '채점하고 있어요' : '정답 확인'}
            </Button>
          </div>
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
