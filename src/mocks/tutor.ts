/**
 * AI 튜터 목업
 * - 하루 무료 질문 횟수(N)와 초과 시 도토리 비용(M)은 아직 미정이라 상수로 둔다.
 * - askTutor는 서버 API가 붙기 전까지 쓰는 가짜 응답이다.
 *   질문에 '오류'를 넣으면 실패 상태를 확인할 수 있다.
 */
import type { Term } from './learn'

export const TUTOR_FREE_PER_DAY = 3 // N (미정)
export const TUTOR_ACORN_COST = 1 // M (미정)
export const MY_ACORNS = 12

export function askTutor(term: Term, question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (question.includes('오류')) {
        reject(new Error('mock error'))
        return
      }
      resolve(
        `${term.name}은(는) ${term.meaning}이에요. 예를 들어 ${term.example} 더 궁금한 게 있으면 편하게 물어보세요.`,
      )
    }, 900)
  })
}
