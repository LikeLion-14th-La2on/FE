/**
 * AI 튜터: 용어 하나를 기준으로 쉬운 말로 답한다 (용어 DB 안에서만).
 * - 하루 무료 3회, 다 쓰면 도토리 1개로 질문할지 먼저 확인
 * - 남은 무료 횟수 · 도토리는 답을 받을 때마다 서버 값으로 바꾼다
 * - 답변 중엔 입력 잠금, 실패하면 '다시 시도' (서버가 횟수·도토리를 줄이지 않음)
 * - 새 메시지·답변·도토리 확인이 생기면 입력창까지 보이게 아래로 스크롤한다.
 */
import clsx from 'clsx'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams } from 'react-router'

import { ApiError } from '@/api/client'
import { getTerm, parseTermId, type TermDetail } from '@/api/terms'
import {
  askTutor,
  loadFreeRemaining,
  saveFreeRemaining,
  TUTOR_ACORN_COST,
  TUTOR_FREE_PER_DAY,
} from '@/api/tutor'
import { getMe } from '@/api/user'
import { Button, LoadError, Loading, PageHeader, TutorAvatar } from '@/components/common'
import { useApi } from '@/hooks/useApi'

type Message =
  | { id: number; role: 'user'; text: string }
  | {
      id: number
      role: 'tutor'
      status: 'loading' | 'done' | 'error'
      text?: string
      question: string
      /** 다시 물어도 소용없는 실패(도토리 부족 등)는 '다시 시도'를 숨긴다 */
      retryable?: boolean
    }

let seq = 0

/** 질문 길이 제한 (BE: 1~300자) */
const MAX_QUESTION = 300
const NOT_FOUND = new ApiError('아직 준비되지 않은 용어입니다', 'E404', 404)

export default function AiTutorPage() {
  const termId = parseTermId(useParams().termId)
  const term = useApi(
    (signal) => (termId ? getTerm(termId, signal) : Promise.reject(NOT_FOUND)),
    String(termId),
  )

  if (term.status === 'success') return <TutorChat term={term.data} />
  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title="AI 튜터" />
      {term.status === 'loading' ? (
        <Loading />
      ) : term.error.status === 404 ? (
        <>
          <p className="pt-16 text-center text-[17px] leading-[1.4] font-bold text-herb">
            아직 준비되지 않은 용어예요
          </p>
          <p className="text-center text-[13px] leading-[1.4] text-avocado-400">
            용어는 계속 추가하고 있어요
          </p>
        </>
      ) : (
        <LoadError message={term.error.message} onRetry={term.reload} />
      )}
    </div>
  )
}

function TutorChat({ term }: { term: TermDetail }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [freeLeft, setFreeLeft] = useState(loadFreeRemaining)
  // 처음엔 내 정보의 잔액, 질문하고 나면 튜터 응답의 잔액
  const me = useApi(getMe, 'me')
  const [answeredBalance, setAnsweredBalance] = useState<number | null>(null)
  const acorns = answeredBalance ?? me.data?.acornBalance ?? null
  const [pending, setPending] = useState<string | null>(null)

  const loading = messages.some((m) => m.role === 'tutor' && m.status === 'loading')

  /** 대화가 화면보다 길어지면 새 내용이 화면 밖에 생기므로 맨 아래(입력창)로 따라간다 */
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (messages.length === 0 && pending === null) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    bottomRef.current?.scrollIntoView({ block: 'end', behavior: reduce ? 'auto' : 'smooth' })
  }, [messages, pending])

  const update = (id: number, patch: Partial<Extract<Message, { role: 'tutor' }>>) =>
    setMessages((ms) => ms.map((m) => (m.id === id && m.role === 'tutor' ? { ...m, ...patch } : m)))

  /** 답을 받았을 때만 서버가 무료 횟수(또는 도토리)를 쓴다 */
  const run = (question: string, tutorId: number) => {
    askTutor(term.termId, question).then(
      (res) => {
        setFreeLeft(res.freeRemaining)
        saveFreeRemaining(res.freeRemaining)
        setAnsweredBalance(res.acornBalance)
        update(tutorId, { status: 'done', text: res.answer })
      },
      (e: unknown) => {
        const error = e instanceof ApiError ? e : null
        // E400: 도토리 부족(무료를 다 쓴 상태) 또는 잘못된 질문. 다시 물어도 같은 결과
        if (error?.code === 'E400') {
          if (error.message.includes('도토리')) {
            setFreeLeft(0)
            saveFreeRemaining(0)
          }
          update(tutorId, { status: 'error', text: error.message, retryable: false })
          return
        }
        update(tutorId, {
          status: 'error',
          text:
            error?.code === 'E503' || error?.code === 'NETWORK'
              ? error.message
              : '답변을 가져오지 못했어요. 잠시 후 다시 물어봐 주세요.',
          retryable: true,
        })
      },
    )
  }

  const send = (question: string) => {
    const tutorId = ++seq
    setMessages((ms) => [
      ...ms,
      { id: ++seq, role: 'user', text: question },
      { id: tutorId, role: 'tutor', status: 'loading', question },
    ])
    run(question, tutorId)
  }

  const retry = (m: Extract<Message, { role: 'tutor' }>) => {
    update(m.id, { status: 'loading', text: undefined })
    run(m.question, m.id)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    if (freeLeft > 0) send(q)
    else setPending(q)
  }

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title="AI 튜터" />

      <section className="flex flex-col gap-1 rounded-[24px] bg-avocado-100 p-4">
        <h1 className="text-[16px] leading-[1.4] font-black text-herb">{term.name}</h1>
        <p className="text-[13px] leading-[1.4] text-herb">{term.easyExplanation}</p>
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
                    'flex flex-1 flex-col items-start gap-2 rounded-[24px] px-3.5 py-2.5 text-[14px] leading-[1.4] whitespace-pre-line',
                    m.status === 'error'
                      ? 'bg-burnt-orange-100 text-burnt-orange-700'
                      : 'bg-coconut-100 shadow-card',
                    m.status === 'loading'
                      ? 'text-avocado-400'
                      : m.status === 'done' && 'text-herb',
                  )}
                >
                  {m.status === 'loading' && '답변을 만들고 있어요 · · ·'}
                  {m.status !== 'loading' && m.text}
                  {m.status === 'error' && m.retryable && (
                    <button
                      type="button"
                      onClick={() => retry(m)}
                      className="rounded-full bg-apricot-600 px-3 py-1.5 text-[12px] leading-[1.4] font-bold text-coconut-300"
                    >
                      다시 시도
                    </button>
                  )}
                </div>
              </div>
              {m.status === 'error' && (
                <p className="text-[12px] leading-[1.4] text-avocado-400">
                  무료 질문 횟수와 도토리는 줄어들지 않았어요
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
            {acorns !== null && `보유 도토리 ${acorns}개 · `}내일 0시에 무료 질문이 다시 채워져요
          </p>
          {acorns === null || acorns >= TUTOR_ACORN_COST ? (
            <Button
              onClick={() => {
                send(pending)
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

      <div ref={bottomRef} className="mt-auto flex flex-col gap-gap">
        <span className="self-start rounded-full bg-apricot-100 px-3 py-[5px] text-[11px] leading-[1.4] font-bold text-apricot-700">
          {freeLeft <= 0
            ? '오늘 무료 질문을 모두 썼어요'
            : messages.length === 0 && freeLeft === TUTOR_FREE_PER_DAY
              ? `하루 무료 질문 ${TUTOR_FREE_PER_DAY}회 · 이후 1회당 도토리 ${TUTOR_ACORN_COST}개`
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
