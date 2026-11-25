/**
 * 내 숲 API (GET /api/v1/forest): 완성한 나무 도감
 * - 지금 키우는 나무는 여기 없고, 홈 응답의 tree를 쓴다
 */
import { api } from './client'

export type ForestTree = {
  treeId: number
  /** 완성한 날짜 (한국 날짜, yyyy-MM-dd) */
  completedAt: string
  /** 이 나무를 키우는 동안 끊김으로 떨어진 도토리 수 */
  fallenCount: number
}

export type Forest = {
  /** 홈 응답의 tree.treeCount와 같은 값 */
  treeCount: number
  /** 완성 최신순 */
  trees: ForestTree[]
}

export const getForest = (signal?: AbortSignal) => api<Forest>('/api/v1/forest', { signal })
