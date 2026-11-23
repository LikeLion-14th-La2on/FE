/**
 * 로그인: 캐릭터 + 서비스 소개 + 카카오로 시작하기
 * - 이미 로그인한 사용자(토큰 있음)가 앱을 다시 열면, 내 정보(GET /users/me)의 온보딩 상태를 보고
 *   남은 단계(약관 → 닉네임 → 레벨 테스트) 또는 홈으로 바로 보낸다.
 * - 토큰이 만료돼 재발급도 실패하면 공통 호출 함수가 토큰을 지우고, 이 화면에 그대로 남는다.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { kakaoAuthorizeUrl, nextRouteAfterLogin } from '@/api/auth'
import { getMe } from '@/api/user'
import squirrel from '@/assets/squirrel.webp'

export default function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return
    const controller = new AbortController()
    getMe(controller.signal)
      .then((me) => navigate(nextRouteAfterLogin(me), { replace: true }))
      .catch(() => {
        // 로그인이 풀렸거나 서버 오류면 카카오 로그인 버튼을 그대로 보여 준다
      })
    return () => controller.abort()
  }, [navigate])

  return (
    <div className="mx-auto min-h-dvh w-full max-w-app bg-apricot-700">
      <main className="flex min-h-dvh flex-col px-gutter pt-gutter pb-[calc(var(--spacing-gutter)+env(safe-area-inset-bottom))]">
        <div className="flex flex-1 flex-col items-center justify-center gap-gap">
          {/* Figma 단계 완수 화면의 3D 다람쥐(배경 투명) */}
          <img src={squirrel} alt="다람쥐 캐릭터" className="w-[170px]" />
          <h1 className="pt-2 text-[32px] font-black text-coconut-500">도토리치</h1>
          <p className="text-body text-coconut-500">하루 5문제, 도토리처럼 쌓는 금융 상식</p>
        </div>

        <div className="flex flex-col gap-3">
          {/* 카카오 브랜드 색은 이 버튼에서만 쓰므로 토큰 대신 직접 지정 */}
          <button
            type="button"
            onClick={() => window.location.assign(kakaoAuthorizeUrl())}
            className="h-btn w-full rounded-btn bg-[#FEE500] text-card-title text-herb shadow-[0_4px_0_#D9C300] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-none"
          >
            카카오로 3초 만에 시작하기
          </button>
          <p className="text-center text-sub text-coconut-500">시작하면 약관에 동의하게 됩니다</p>
        </div>
      </main>
    </div>
  )
}
