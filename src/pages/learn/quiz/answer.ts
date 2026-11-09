/** 문제 유형별 답 상태와 채점 */
import type { QuizQuestion } from '@/mocks/learn'

export type Answer =
  | { kind: 'ox'; value: 'O' | 'X' }
  | { kind: 'choice'; value: number }
  /** 매칭: 왼쪽 용어 index → 오른쪽 뜻 index(화면에 보이는 순서) */
  | { kind: 'matching'; links: Record<number, number> }

/** 매칭 오른쪽 뜻의 화면 순서 (정답 순서와 겹치지 않게 고정으로 섞음) */
export const MEANING_ORDER = [2, 0, 3, 1]

export function isComplete(q: QuizQuestion, a: Answer | null): boolean {
  if (!a) return false
  if (q.type === 'matching')
    return a.kind === 'matching' && Object.keys(a.links).length === q.pairs.length
  return true
}

export function isCorrect(q: QuizQuestion, a: Answer | null): boolean {
  if (!a) return false
  switch (q.type) {
    case 'ox':
      return a.kind === 'ox' && a.value === q.answer
    case 'choice':
    case 'situation':
      return a.kind === 'choice' && a.value === q.answer
    case 'matching':
      return a.kind === 'matching' && q.pairs.every((_, i) => MEANING_ORDER[a.links[i]] === i)
  }
}

export const TYPE_LABEL: Record<QuizQuestion['type'], string> = {
  ox: 'OX',
  choice: '4지선다',
  situation: '상황형',
  matching: '매칭',
}

export const CIRCLED = ['①', '②', '③', '④']

/** 단계 완수 화면으로 넘기는 결과 */
export type StageResult = { correct: number; total: number; stillWrong: number; newTerms: number }
