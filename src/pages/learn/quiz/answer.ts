/** 문제 유형별 답 상태 · 서버로 보낼 답 형식 · 표시 문구 */
import type { SessionQuestion } from '@/api/learn'
import type { AnswerValue, MatchingChoices, QuestionType } from '@/api/types'

export type Answer =
  | { kind: 'ox'; value: 'O' | 'X' }
  | { kind: 'choice'; value: number }
  /** 매칭: 왼쪽 용어 index → 오른쪽 뜻 index(화면에 보이는 순서) */
  | { kind: 'matching'; links: Record<number, number> }

export const TYPE_LABEL: Record<QuestionType, string> = {
  OX: 'OX',
  MULTIPLE: '4지선다',
  SITUATION: '상황형',
  MATCHING: '매칭',
}

export const CIRCLED = ['①', '②', '③', '④']

/** 상황형 질문 문구는 FE에서 고정 (BE는 상황 설명만 보낸다). 문제 풀이·레벨 테스트 공통 */
export const SITUATION_PROMPT = '이 상황에 맞는\n개념은?'

/** OX 버튼 색 + 아래 그림자(버튼 색 +200) */
export const OX_CLASS: Record<'O' | 'X', string> = {
  O: 'bg-avocado-500 shadow-[0_4px_0_var(--color-avocado-700)]',
  X: 'bg-burnt-orange-500 shadow-[0_4px_0_var(--color-burnt-orange-700)]',
}

/**
 * 단어 뒤 '이에요/예요' (받침 있으면 이에요). 끝의 괄호(예: 담보인정비율(LTV))는 빼고 본다.
 * 한글로 안 끝나면(영문·숫자) '이에요'
 */
export function withIeyo(word: string): string {
  const last = word
    .replace(/\s*\([^)]*\)$/, '')
    .trim()
    .slice(-1)
  const code = last.charCodeAt(0) - 0xac00
  if (code < 0 || code > 11171) return `${word}이에요`
  return code % 28 === 0 ? `${word}예요` : `${word}이에요`
}

export const choicesOf = (q: SessionQuestion): string[] =>
  Array.isArray(q.choices) ? q.choices : []

/**
 * 매칭 오른쪽 뜻의 화면 순서. 서버는 용어와 같은 순서로 줄 수 있어서 섞는다.
 * 같은 문제는 늘 같은 순서(questionId로 정함)라, 튜터에 다녀와도 짝이 그대로다.
 */
export function matchingOf(q: SessionQuestion): MatchingChoices {
  const c = (q.choices ?? { terms: [], meanings: [] }) as MatchingChoices
  const n = c.meanings.length
  if (n < 2) return c
  const shift = (q.questionId % (n - 1)) + 1 // 1 ~ n-1 칸 밀기 → 어떤 뜻도 제자리에 오지 않음
  const meanings = c.meanings.map((_, i) => c.meanings[(i + shift) % n])
  return { terms: c.terms, meanings }
}

export function isComplete(q: SessionQuestion, a: Answer | null): boolean {
  if (!a) return false
  if (q.type === 'MATCHING')
    return a.kind === 'matching' && Object.keys(a.links).length === matchingOf(q).terms.length
  return true
}

/** 화면의 답 → 서버 형식 (OX "O", 객관식 "0"부터, 매칭 {"용어": "뜻"}) */
export function toAnswerValue(q: SessionQuestion, a: Answer): AnswerValue {
  if (a.kind === 'ox') return a.value
  if (a.kind === 'choice') return String(a.value)
  const { terms, meanings } = matchingOf(q)
  return Object.fromEntries(
    Object.entries(a.links).map(([t, m]) => [terms[Number(t)], meanings[m]]),
  )
}

/** 정답 확인 뒤 해설 제목 */
export function wrongTitle(q: SessionQuestion, correctAnswer: AnswerValue): string {
  if (q.type === 'OX') return `아쉬워요, 정답은 ${String(correctAnswer)}예요`
  if (q.type === 'MATCHING') return '아쉬워요, 짝이 틀린 곳이 있어요'
  const i = Number(correctAnswer)
  const option = choicesOf(q)[i]
  return option
    ? `아쉬워요, 정답은 ${CIRCLED[i]}번 ${withIeyo(option)}`
    : '아쉬워요, 정답이 아니에요'
}
