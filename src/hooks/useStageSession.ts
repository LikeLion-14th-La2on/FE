/** 주소의 섹터·단계 번호로 학습 세션(용어 카드 + 문제 5개)을 불러온다. 용어 미리보기·문제 풀이 공통 */
import { loadStageSession } from '@/api/learn'
import type { Sector } from '@/constants/sectors'

import { useApi } from './useApi'

export function useStageSession(sector: Sector, stage: number) {
  return useApi((signal) => loadStageSession(sector, stage, signal), `session:${sector}:${stage}`)
}
