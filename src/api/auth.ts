/**
 * 카카오 로그인 (백엔드 POST /api/v1/auth/kakao)
 * 흐름: 카카오 인가 페이지 → /oauth/kakao?code=… → 백엔드에 code 전달 → 토큰 저장
 */
import { ROUTES } from '@/router/routes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY ?? ''

const redirectUri = () => `${window.location.origin}${ROUTES.kakaoCallback}`

export type LevelTestStatus = 'NONE' | 'DONE' | 'SKIPPED'

export type LoginResult = {
  accessToken: string
  refreshToken: string
  isNewUser: boolean
  onboarding: { termsAgreed: boolean; nicknameSet: boolean; levelTestStatus: LevelTestStatus }
}

/** 카카오 로그인 버튼을 누르면 이동할 주소 */
export function kakaoAuthorizeUrl() {
  const params = new URLSearchParams({
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: redirectUri(),
    response_type: 'code',
  })
  return `https://kauth.kakao.com/oauth/authorize?${params}`
}

/** 카카오가 돌려준 code로 로그인하고 토큰을 저장한다. 실패하면 백엔드 메시지로 Error를 던진다 */
export async function loginWithKakao(code: string): Promise<LoginResult> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/kakao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri: redirectUri() }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.data) {
    throw new Error(body?.message ?? '로그인에 실패했어요. 다시 시도해 주세요')
  }
  const data = body.data as LoginResult
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  return data
}

/** 온보딩에서 아직 안 끝낸 첫 화면 (약관 → 닉네임 → 레벨 테스트 → 홈) */
export function nextRouteAfterLogin({ onboarding }: LoginResult) {
  if (!onboarding.termsAgreed) return ROUTES.terms
  if (!onboarding.nicknameSet) return ROUTES.nickname
  if (onboarding.levelTestStatus === 'NONE') return ROUTES.levelTest
  return ROUTES.home
}
