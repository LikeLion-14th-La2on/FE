/** 사용자 API: 내 정보 · 온보딩 (Notion API 명세서 · Part 1) */
import type { Onboarding } from './auth'
import { api } from './client'

export type Me = {
  userId: number
  nickname: string | null
  characterImageUrl: string | null
  acornBalance: number
  onboarding: Onboarding
}

/** 내 정보 + 온보딩 진행 상태 (로그인 후 남은 온보딩 단계로 보낼 때) */
export const getMe = (signal?: AbortSignal) => api<Me>('/api/v1/users/me', { signal })

/** 마이페이지 학습 현황: 섹터별로 통과한 단계 번호 / 전체 단계 수 */
export type SectorStat = {
  sectorId: number
  name: string
  passedStepNo: number
  totalSteps: number
}

export type Stats = { streak: number; completedStageCount: number; sectors: SectorStat[] }

/** 학습 현황 (연속 학습 · 완수 단계 수 · 섹터별 진행도) */
export const getStats = (signal?: AbortSignal) => api<Stats>('/api/v1/users/me/stats', { signal })

/** 닉네임 중복 확인 (입력이 멈춘 뒤 debounce로 호출) */
export const checkNickname = (nickname: string, signal?: AbortSignal) =>
  api<{ available: boolean }>(`/api/v1/users/check-nickname?${new URLSearchParams({ nickname })}`, {
    signal,
  })

/** 닉네임 등록 (가입 직후). 그 사이 다른 사람이 먼저 쓰면 E409 */
export const registerNickname = (nickname: string) =>
  api<{ nickname: string }>('/api/v1/users/me/nickname', { method: 'POST', body: { nickname } })

/** 닉네임 수정 (마이페이지). 요청 · 응답은 닉네임 등록과 같다. 다른 사람이 쓰는 닉네임이면 E409 */
export const updateNickname = (nickname: string) =>
  api<{ nickname: string }>('/api/v1/users/me/nickname', { method: 'PATCH', body: { nickname } })

/** 약관 동의 저장 (users.terms_agreed_at). 필수 항목이 하나라도 false면 E400 */
export const agreeTerms = (body: { serviceTerms: boolean; privacyPolicy: boolean }) =>
  api<null>('/api/v1/users/me/terms', { method: 'POST', body })

/** 회원탈퇴: 카카오 연결을 끊고 계정 · 학습 기록 · 도토리 내역을 모두 지운다 (되돌릴 수 없음) */
export const withdraw = () => api<null>('/api/v1/users/me', { method: 'DELETE' })

/** 도토리 내역 한 줄 (받으면 +, 쓰면 -) */
export type AcornHistoryItem = { amount: number; reason: string; createdAt: string }
export type Badge = { badgeId: number; name: string; imageUrl: string | null; earnedAt: string }
export type Rewards = { acornBalance: number; acornHistory: AcornHistoryItem[]; badges: Badge[] }

/** 도토리 잔액 · 도토리 내역(최신순) · 받은 배지 */
export const getRewards = (signal?: AbortSignal) =>
  api<Rewards>('/api/v1/users/me/rewards', { signal })
