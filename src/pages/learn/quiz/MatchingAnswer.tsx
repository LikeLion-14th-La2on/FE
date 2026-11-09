/**
 * 매칭 답: 왼쪽 용어를 누른 뒤 오른쪽 뜻을 누르면 연결된다.
 * - 연결된 쌍은 같은 번호 배지로 표시, 이미 연결된 용어를 다시 누르면 연결이 풀린다.
 * - 4쌍을 모두 연결해야 정답 확인을 누를 수 있다.
 */
import clsx from 'clsx'
import { useState } from 'react'

import type { MatchingQuestion } from '@/mocks/learn'

import { MEANING_ORDER } from './answer'

type Props = {
  question: MatchingQuestion
  links: Record<number, number>
  submitted: boolean
  onChange: (links: Record<number, number>) => void
}

const cell =
  'flex min-h-14 w-full items-center gap-2 rounded-option border-2 px-3 py-2.5 text-left text-body font-medium'

export default function MatchingAnswer({ question, links, submitted, onChange }: Props) {
  const [pickedTerm, setPickedTerm] = useState<number | null>(null)
  const meanings = MEANING_ORDER.map((i) => question.pairs[i].meaning)
  const termOfMeaning = (m: number) => {
    const found = Object.entries(links).find(([, v]) => v === m)
    return found ? Number(found[0]) : null
  }
  const linkedCount = Object.keys(links).length

  const pressTerm = (t: number) => {
    if (t in links) {
      const next = { ...links }
      delete next[t]
      onChange(next)
      setPickedTerm(t)
      return
    }
    setPickedTerm(pickedTerm === t ? null : t)
  }

  const pressMeaning = (m: number) => {
    if (pickedTerm === null) return
    const next = { ...links }
    const owner = termOfMeaning(m)
    if (owner !== null) delete next[owner]
    next[pickedTerm] = m
    onChange(next)
    setPickedTerm(null)
  }

  const resultClass = (ok: boolean) =>
    ok ? 'border-avocado-500 bg-avocado-100' : 'border-burnt-orange-500 bg-burnt-orange-100'

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        <ul className="flex flex-col gap-2.5">
          {question.pairs.map((p, t) => {
            const linked = t in links
            const ok = linked && MEANING_ORDER[links[t]] === t
            return (
              <li key={p.term}>
                <button
                  type="button"
                  disabled={submitted}
                  aria-pressed={pickedTerm === t}
                  onClick={() => pressTerm(t)}
                  className={clsx(
                    cell,
                    submitted
                      ? resultClass(ok)
                      : pickedTerm === t
                        ? 'border-apricot-500 bg-apricot-100 font-bold'
                        : linked
                          ? 'border-transparent bg-avocado-100'
                          : 'border-transparent bg-coconut-100 shadow-option',
                  )}
                >
                  {linked && <Badge n={t + 1} />}
                  {p.term}
                </button>
              </li>
            )
          })}
        </ul>
        <ul className="flex flex-col gap-2.5">
          {meanings.map((meaning, m) => {
            const owner = termOfMeaning(m)
            const ok = owner !== null && MEANING_ORDER[m] === owner
            return (
              <li key={meaning}>
                <button
                  type="button"
                  disabled={submitted || pickedTerm === null}
                  onClick={() => pressMeaning(m)}
                  className={clsx(
                    cell,
                    'text-sub',
                    submitted
                      ? resultClass(ok)
                      : owner !== null
                        ? 'border-transparent bg-avocado-100'
                        : pickedTerm !== null
                          ? 'border-apricot-300 bg-coconut-100 shadow-option'
                          : 'border-transparent bg-coconut-100 shadow-option',
                  )}
                >
                  {owner !== null && <Badge n={owner + 1} />}
                  {meaning}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      {!submitted && (
        <p className="text-sub text-avocado-400">
          {question.pairs.length}쌍 중 {linkedCount}쌍 연결했어요
          {pickedTerm !== null && ' · 이제 맞는 뜻을 눌러 주세요'}
        </p>
      )}
    </div>
  )
}

function Badge({ n }: { n: number }) {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-avocado-500 text-tag text-coconut-100">
      {n}
    </span>
  )
}
