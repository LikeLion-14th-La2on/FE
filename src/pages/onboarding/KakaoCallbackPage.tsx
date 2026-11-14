/** 카카오 로그인 콜백: 주소의 code로 로그인한 뒤 온보딩 다음 화면으로 이동 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { loginWithKakao, nextRouteAfterLogin } from '@/api/auth'
import squirrel from '@/assets/squirrel.webp'
import { Button } from '@/components/common'
import { ROUTES } from '@/router/routes'

export default function KakaoCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const code = params.get('code')
  const [loginError, setLoginError] = useState<string | null>(null)
  const error = code ? loginError : '카카오 로그인이 취소되었어요'
  // 카카오 code는 한 번만 쓸 수 있어서, 개발 모드(StrictMode)에서 effect가 두 번 돌아도 한 번만 요청한다
  const requested = useRef(false)

  useEffect(() => {
    if (!code || requested.current) return
    requested.current = true

    loginWithKakao(code)
      .then((result) => navigate(nextRouteAfterLogin(result), { replace: true }))
      .catch((e: Error) => setLoginError(e.message))
  }, [code, navigate])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-gap">
      <img src={squirrel} alt="다람쥐 캐릭터" className="w-[120px]" />
      {error ? (
        <>
          <p className="text-center text-body">{error}</p>
          <Button onClick={() => navigate(ROUTES.login, { replace: true })}>다시 시도하기</Button>
        </>
      ) : (
        <p className="text-body text-avocado-400">로그인하는 중이에요</p>
      )}
    </div>
  )
}
