/**
 * AI 튜터: 용어 하나를 기준으로 쉬운 말로 답한다 (용어 DB 안에서만).
 * - 하루 무료 N회, 다 쓰면 도토리 M개로 질문할지 확인
 * - 답변 중엔 입력 잠금, 실패하면 '다시 시도' (무료 횟수 차감 안 함)
 */
import clsx from 'clsx'
import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router'

import { Button, PageHeader, TutorAvatar } from '@/components/common'
import { getTerm } from '@/mocks/learn'
import { MY_ACORNS, TUTOR_ACORN_COST, TUTOR_FREE_PER_DAY, askTutor } from '@/mocks/tutor'

type Message =
  | { id: number; role: 'user'; text: string }
  | {
      id: number
      role: 'tutor'
      status: 'loading' | 'done' | 'error'
      text?: string
      question: string
      /** 무료 횟수를 다 써서 도토리로 묻는 질문인지 */
      paid: boolean
    }

let seq = 0

/** 질문 길이 제한 (BE: 1~300자) */
const MAX_QUESTION = 300

export default function AiTutorPage() {
  const { termId } = useParams()
  const term = getTerm(termId)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [freeLeft, setFreeLeft] = useState(TUTOR_FREE_PER_DAY)
  const [acorns, setAcorns] = useState(MY_ACORNS)
  const [pending, setPending] = useState<string | null>(null)

  const loading = messages.some((m) => m.role === 'tutor' && m.status === 'loading')

  if (!term) {
    return (
      <div className="flex flex-1 flex-col gap-gap">
        <PageHeader title="AI 튜터" />
        <p className="pt-16 text-center text-[17px] leading-[1.4] font-bold text-herb">
          아직 준비되지 않은 용어예요
        </p>
        <p className="text-center text-[13px] leading-[1.4] text-avocado-400">
          용어는 계속 추가하고 있어요
        </p>
      </div>
    )
  }

  /** 답을 받았을 때만 무료 횟수(또는 도토리)를 쓴다. 실패하면 차감하지 않는다. */
  const run = (question: string, tutorId: number, paid: boolean) => {
    askTutor(term, question).then(
      (text) => {
        if (paid) setAcorns((a) => a - TUTOR_ACORN_COST)
        else setFreeLeft((n) => n - 1)
        setMessages((ms) =>
          ms.map((m) => (m.id === tutorId ? { ...m, status: 'done' as const, text } : m)),
        )
      },
      () => {
        setMessages((ms) =>
          ms.map((m) => (m.id === tutorId ? { ...m, status: 'error' as const } : m)),
        )
      },
    )
  }

  const send = (question: string, paid: boolean) => {
    const tutorId = ++seq
    setMessages((ms) => [
      ...ms,
      { id: ++seq, role: 'user', text: question },
      { id: tutorId, role: 'tutor', status: 'loading', question, paid },
    ])
    run(question, tutorId, paid)
  }

  const retry = (m: Extract<Message, { role: 'tutor' }>) => {
    setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, status: 'loading' as const } : x)))
    run(m.question, m.id, m.paid)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    if (freeLeft > 0) send(q, false)
    else setPending(q)
  }

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title="AI 튜터" />

      <section className="flex flex-col gap-1 rounded-[24px] bg-avocado-100 p-4">
        <h1 className="text-[16px] leading-[1.4] font-black text-herb">{term.name}</h1>
        <p className="text-[13px] leading-[1.4] text-herb">{term.meaning}</p>
      </section>

      <ol className="flex flex-col gap-gap" aria-live="polite">
        {messages.length === 0 && (
          <li className="text-center text-[12px] leading-[1.4] text-avocado-400">
            {term.name}에 대해 궁금한 걸 편하게 물어보세요
          </li>
        )}
        {messages.map((m) =>
          m.role === 'user' ? (
            <li
              key={m.id}
              className="max-w-[64%] self-end rounded-[24px] bg-apricot-600 px-3.5 py-2.5 text-[14px] leading-[1.4] font-medium text-coconut-500"
            >
              {m.text}
            </li>
          ) : (
            <li key={m.id} className="flex flex-col gap-gap">
              <div className="flex items-start gap-2">
                <TutorAvatar />
                <div
                  className={clsx(
                    'flex flex-1 flex-col items-start gap-2 rounded-[24px] px-3.5 py-2.5 text-[14px] leading-[1.4]',
                    m.status === 'error'
                      ? 'bg-burnt-orange-100 text-burnt-orange-700'
                      : 'bg-coconut-100 shadow-card',
                    m.status === 'loading'
                      ? 'text-avocado-400'
                      : m.status === 'done' && 'text-herb',
                  )}
                >
                  {m.status === 'loading' && '답변을 만들고 있어요 · · ·'}
                  {m.status === 'done' && m.text}
                  {m.status === 'error' && (
                    <>
                      답변을 가져오지 못했어요. 잠시 후 다시 물어봐 주세요.
                      <button
                        type="button"
                        onClick={() => retry(m)}
                        className="rounded-full bg-apricot-600 px-3 py-1.5 text-[12px] leading-[1.4] font-bold text-coconut-300"
                      >
                        다시 시도
                      </button>
                    </>
                  )}
                </div>
              </div>
              {m.status === 'error' && (
                <p className="text-[12px] leading-[1.4] text-avocado-400">
                  무료 질문 횟수는 줄어들지 않았어요
                </p>
              )}
            </li>
          ),
        )}
        {loading && (
          <li className="text-[12px] leading-[1.4] text-avocado-400">보통 몇 초면 끝나요</li>
        )}
      </ol>

      {pending !== null && (
        <section className="flex flex-col gap-2.5 rounded-[24px] bg-coconut-100 px-4 py-[18px] shadow-card">
          <h2 className="text-[16px] leading-[1.2] font-bold text-herb">
            도토리 {TUTOR_ACORN_COST}개로 질문할까요?
          </h2>
          <p className="text-[13px] leading-[1.2] text-avocado-400">
            보유 도토리 {acorns}개 · 내일 0시에 무료 질문이 다시 채워져요
          </p>
          {acorns >= TUTOR_ACORN_COST ? (
            <Button
              onClick={() => {
                send(pending, true)
                setPending(null)
              }}
            >
              도토리 쓰고 질문하기
            </Button>
          ) : (
            <p className="text-[13px] leading-[1.4] text-burnt-orange-600">
              도토리가 부족해요 · 학습하고 모아요
            </p>
          )}
          <Button variant="secondary" onClick={() => setPending(null)}>
            다음에 할게요
          </Button>
        </section>
      )}

      <div className="mt-auto flex flex-col gap-gap">
        <span className="self-start rounded-full bg-apricot-100 px-3 py-[5px] text-[11px] leading-[1.4] font-bold text-apricot-700">
          {freeLeft <= 0
            ? '오늘 무료 질문을 모두 썼어요'
            : messages.length === 0
              ? `오늘 무료 질문 ${freeLeft}회 남음 · 이후 1회당 도토리 ${TUTOR_ACORN_COST}개`
              : `오늘 무료 질문 ${freeLeft}회 남음`}
        </span>
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 rounded-[24px] bg-coconut-100 px-4 py-3 shadow-card"
        >
          <label htmlFor="tutor-input" className="sr-only">
            질문 입력
          </label>
          <input
            id="tutor-input"
            value={input}
            maxLength={MAX_QUESTION}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={loading ? '답변을 기다리고 있어요' : '궁금한 걸 물어보세요'}
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-[1.4] text-herb outline-none placeholder:text-avocado-400"
          />
          <button
            type="submit"
            aria-label="보내기"
            disabled={loading || !input.trim()}
            className="flex h-[34.4px] w-10 shrink-0 items-center justify-center rounded-[12px] bg-apricot-600 text-[16px] leading-[1.4] font-black text-coconut-500"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  )
}
