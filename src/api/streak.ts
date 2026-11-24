/** 스트릭 API: 보호권 (Notion API 명세서 · 마이페이지) */
import { api } from './client'

/**
 * 보호권 1개 구매 (도토리 5개 차감, 도토리 내역 사유 STREAK_SHIELD)
 * - 서버가 끊김 판정을 먼저 처리한 뒤 산다 (이미 지난 끊김을 방금 산 보호권으로 막을 수 없게)
 * - 이미 2개면 · 도토리가 부족하면 E400 (서버 메시지를 그대로 보여 준다)
 */
export const buyShield = () =>
  api<{ shieldCount: number; acornBalance: number }>('/api/v1/streak/shields', {
    method: 'POST',
  })
