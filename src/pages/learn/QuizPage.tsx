/**
 * 문제 풀이 (단계 하나 = 5문제)
 * 1. 5문제를 푼다. 답을 고르기 전엔 정답 확인 비활성, 제출하면 아래에 해설.
 * 2. 틀린 문제는 5문제 뒤에 1번만 다시 낸다.
 * 3. 다시 풀기 결과와 상관없이 단계 완수 → 다시 틀린 문제는 내일 카드뉴스로.
 * 풀다가 나가면 이 단계는 처음부터 (나가기 확인 시트).
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button, QuizTopBar } from '@/components/common'
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

  const [queue, setQueue] = useState<QuizQuestion[]>(questions)
  const [retry, setRetry] = useState(false)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [wrong, setWrong] = useState<QuizQuestion[]>([])
  const [stillWrong, setStillWrong] = useState(0)
  const [exitOpen, setExitOpen] = useState(false)

  const q = queue[index]
  const correct = submitted && isCorrect(q, answer)
  const isLastInRound = index === queue.length - 1

  const submit = () => {
    setSubmitted(true)
    if (!isCorrect(q, answer)) {
      if (retry) setStillWrong((n) => n + 1)
      else setWrong((list) => [...list, q])
    }
  }

  const finish = (result: StageResult) =>
    navigate(ROUTES.stageComplete(sector, stage), { replace: true, state: result })

  const next = () => {
    setAnswer(null)
    setSubmitted(false)
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

      <span
        className={
          retry
            ? 'self-start rounded-full bg-apricot-100 px-2.5 py-1 text-tag text-apricot-700'
            : 'self-start rounded-full bg-herb-100 px-2.5 py-1 text-tag text-herb'
        }
      >
        {retry ? '틀린 문제 다시 풀기 · 1번만' : TYPE_LABEL[q.type]}
      </span>

      {q.type === 'situation' && (
        <p className="rounded-[10px] border-l-4 border-apricot-500 bg-apricot-100 px-4 py-3 text-body text-apricot-800">
          {q.situation}
        </p>
      )}

      <h1 className="text-question font-black whitespace-pre-line">{q.prompt}</h1>

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
      </div>

      <div className="mt-auto pt-2">
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
          />
        ) : (
          <Button disabled={!isComplete(q, answer)} onClick={submit}>
            정답 확인
          </Button>
        )}
      </div>

      <BottomSheet open={exitOpen} onClose={() => setExitOpen(false)} labelledBy="quiz-exit-title">
        <h2 id="quiz-exit-title" className="text-title">
          학습을 그만둘까요?
        </h2>
        <p className="text-body text-avocado-400">
          지금 나가면 이 단계는 처음부터 다시 풀어야 해요. 푼 문제는 저장되지 않아요.
        </p>
        <Button onClick={() => setExitOpen(false)}>계속 풀기</Button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.home, { replace: true })}
          className="h-btn text-card-title text-coconut-800"
        >
          나가기
        </button>
      </BottomSheet>
    </div>
  )
}
