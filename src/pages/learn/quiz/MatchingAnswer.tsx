/**
 * 매칭 답 (Figma '문제 풀이 · 매칭' / '문제 풀이 · 매칭 · 정답 확인 후')
 * - 왼쪽 용어를 누른 뒤 오른쪽 뜻을 누르면 짝이 된다. 선은 긋지 않는다.
 * - 짝이 된 칸은 ✓ 없이 색으로만 표시 (avocado-100 + avocado-500 테두리).
 * - 지금 고른 용어는 apricot-100 + apricot-500 테두리. 짝이 된 용어를 다시 누르면 풀린다.
 * - 4쌍을 모두 짝지어야 정답 확인을 누를 수 있다.
 * - 정답 확인 후: 칸 색은 그대로 두고, 맞힌 짝의 두 칸에만 ✓ 배지를 붙인다.
 * 칸: 425×115 → 높이 46, 모서리 24, 테두리 2, 글자 13 Medium
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
  'relative flex min-h-[46px] w-full items-center rounded-[24px] border-2 px-3.5 py-2 text-left text-[13px] leading-[1.4]'
const idleClass = 'border-transparent bg-coconut-100 font-medium text-herb shadow-card'
const linkedClass = 'border-avocado-500 bg-avocado-100 font-medium text-herb'
const pickedClass = 'border-apricot-500 bg-apricot-100 font-bold text-apricot-800'

/** 맞힌 짝 표시: 칸 오른쪽 위에 걸치는 54 원 (avocado-500, coconut-100 테두리 5) */
function CorrectBadge() {
  return (
    <span
      aria-label="정답"
      className="absolute -top-[8.4px] -right-[6px] flex size-[21.6px] items-center justify-center rounded-full border-2 border-coconut-100 bg-avocado-500 text-[12px] leading-none font-black text-coconut-100"
    >
      ✓
    </span>
  )
}

export default function MatchingAnswer({ question, links, submitted, onChange }: Props) {
  const [pickedTerm, setPickedTerm] = useState<number | null>(null)
  const meanings = MEANING_ORDER.map((i) => question.pairs[i].meaning)
  const termOfMeaning = (m: number) => {
    const found = Object.entries(links).find(([, v]) => v === m)
    return found ? Number(found[0]) : null
  }
  const linkedCount = Object.keys(links).length
  const correctCount = question.pairs.filter(
    (_, t) => t in links && MEANING_ORDER[links[t]] === t,
  ).length

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

  return (
    <div className="flex flex-col gap-gap">
      <div className="grid grid-cols-2 gap-2.5">
        <ul className="flex flex-col gap-2">
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
                    pickedTerm === t && !submitted ? pickedClass : linked ? linkedClass : idleClass,
                  )}
                >
                  {p.term}
                  {submitted && ok && <CorrectBadge />}
                </button>
              </li>
            )
          })}
        </ul>
        <ul className="flex flex-col gap-2">
          {meanings.map((meaning, m) => {
            const owner = termOfMeaning(m)
            const ok = owner !== null && MEANING_ORDER[m] === owner
            return (
              <li key={meaning}>
                <button
                  type="button"
                  disabled={submitted || pickedTerm === null}
                  onClick={() => pressMeaning(m)}
                  className={clsx(cell, owner !== null ? linkedClass : idleClass)}
                >
                  {meaning}
                  {submitted && ok && <CorrectBadge />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <p className="text-[12px] leading-[1.4] text-avocado-400">
        {submitted
          ? `${question.pairs.length}쌍 중 ${correctCount}쌍 맞혔어요`
          : `${question.pairs.length}쌍 중 ${linkedCount}쌍 연결했어요`}
      </p>
    </div>
  )
}
