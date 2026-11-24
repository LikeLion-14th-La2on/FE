/**
 * 홈 API (GET /api/v1/home)
 * - 서버가 홈 조회 때 연속 학습 끊김을 판정하고(보호권 자동 사용 등), 처리 후 값을 내려준다
 * - 지금은 마이페이지에서 쓰는 값만 타입으로 적어 둔다 (보호권 수 · 도토리 잔액)
 *   TODO: 홈 화면 API 연결 때 나머지 필드(닉네임 · 나무 · 오늘의 섹터 등) 추가
 */
import { api } from './client'

export type Home = {
  streak: {
    /** 끊김 처리 후 지금 가진 보호권 수 (최대 2) */
    shieldCount: number
  }
  /** 끊김 처리 후 도토리 잔액 */
  acornBalance: number
}

export const getHome = (signal?: AbortSignal) => api<Home>('/api/v1/home', { signal })
