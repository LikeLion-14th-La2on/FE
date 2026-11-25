/** 나무 공통: 나무 하나에 도토리 수 · 수확 보너스 · 계절 나무 · 'n번째' 표시 */
import treeAutumn from '@/assets/tree/tree-autumn.svg'
import treeSpring from '@/assets/tree/tree-spring.svg'
import treeSummer from '@/assets/tree/tree-summer.svg'
import treeWinter from '@/assets/tree/tree-winter.svg'

export const ACORNS_PER_TREE = 7
/** 수확 보너스: 단계 완수 응답에 treeBonus가 아직 없을 때 쓰는 값 (서버 현재 값) */
export const HARVEST_BONUS = 5

export const SEASONS = {
  spring: { name: '봄', emoji: '🌸', image: treeSpring },
  summer: { name: '여름', emoji: '🌿', image: treeSummer },
  autumn: { name: '가을', emoji: '🍂', image: treeAutumn },
  winter: { name: '겨울', emoji: '❄️', image: treeWinter },
} as const

/** 달 → 계절 나무: 봄(3~5) · 여름(6~8) · 가을(9~11) · 겨울(12~2), 기본값은 이번 달 */
export function getSeason(month = new Date().getMonth() + 1) {
  if (month >= 3 && month <= 5) return SEASONS.spring
  if (month >= 6 && month <= 8) return SEASONS.summer
  if (month >= 9 && month <= 11) return SEASONS.autumn
  return SEASONS.winter
}

const ORDINALS = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열']

/** 1 → '첫 번째', 2 → '두 번째' … 11부터는 '11번째' */
export function toOrdinal(n: number) {
  return n >= 1 && n <= ORDINALS.length ? `${ORDINALS[n - 1]} 번째` : `${n}번째`
}
