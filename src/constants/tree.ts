/**
 * 나무 규칙: 누적 학습일(user_streaks.total_study_days) 하나로 전부 계산한다
 * - 하루 학습(1단계 완수) → 도토리 1개, 다람쥐 한 칸 위로
 * - 7개가 다 열리면 수확(보너스 도토리) → 내 숲에 저장 → 다음 계절 나무 시작
 * - 하루 빠뜨려도 나무는 그대로 (스트릭만 0)
 */
import treeAutumn from '@/assets/tree/tree-autumn.svg'
import treeSpring from '@/assets/tree/tree-spring.svg'
import treeSummer from '@/assets/tree/tree-summer.svg'
import treeWinter from '@/assets/tree/tree-winter.svg'

export const ACORNS_PER_TREE = 7
/** 수확 보너스 (도토리 내역 사유 TREE_HARVEST) */
export const HARVEST_BONUS = 20

/** 봄 → 여름 → 가을 → 겨울 반복 */
export const SEASONS = [
  { name: '봄', emoji: '🌸', image: treeSpring },
  { name: '여름', emoji: '🌿', image: treeSummer },
  { name: '가을', emoji: '🍂', image: treeAutumn },
  { name: '겨울', emoji: '❄️', image: treeWinter },
] as const

/** n번째 나무(0부터)의 계절 = 나무 번호 ÷ 4의 나머지 */
export function getTreeSeason(treeIndex: number) {
  return SEASONS[((treeIndex % SEASONS.length) + SEASONS.length) % SEASONS.length]
}

/**
 * 누적 학습일 → 지금 키우는 나무
 * - treeIndex: 몇 번째 나무인지 (0부터, = 숲에 심은 나무 수)
 * - acornCount: 지금 나무에 열린 도토리 (= 일수 ÷ 7의 나머지)
 */
export function getTreeProgress(totalStudyDays: number) {
  const days = Math.max(Math.floor(totalStudyDays), 0)
  const treeIndex = Math.floor(days / ACORNS_PER_TREE)
  return { treeIndex, acornCount: days % ACORNS_PER_TREE, season: getTreeSeason(treeIndex) }
}

/** 오늘 학습으로 막 7개를 채웠는지 (= 수확 화면을 보여 줄 때): 일수가 7의 배수가 된 순간 */
export function isHarvestDay(totalStudyDays: number) {
  return totalStudyDays > 0 && totalStudyDays % ACORNS_PER_TREE === 0
}

const ORDINALS = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열']

/** 1 → '첫 번째', 2 → '두 번째' … 11부터는 '11번째' */
export function toOrdinal(n: number) {
  return n >= 1 && n <= ORDINALS.length ? `${ORDINALS[n - 1]} 번째` : `${n}번째`
}
