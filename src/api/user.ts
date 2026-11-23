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

/** 닉네임 중복 확인 (입력이 멈춘 뒤 debounce로 호출) */
export const checkNickname = (nickname: string, signal?: AbortSignal) =>
  api<{ available: boolean }>(`/api/v1/users/check-nickname?${new URLSearchParams({ nickname })}`, {
    signal,
  })

/** 닉네임 등록 (가입 직후). 그 사이 다른 사람이 먼저 쓰면 E409 */
export const registerNickname = (nickname: string) =>
  api<{ nickname: string }>('/api/v1/users/me/nickname', { method: 'POST', body: { nickname } })

/** 약관 동의 저장 (users.terms_agreed_at). 필수 항목이 하나라도 false면 E400 */
export const agreeTerms = (body: { serviceTerms: boolean; privacyPolicy: boolean }) =>
  api<null>('/api/v1/users/me/terms', { method: 'POST', body })
