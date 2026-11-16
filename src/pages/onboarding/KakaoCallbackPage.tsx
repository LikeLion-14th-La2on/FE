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
  const kakaoError = params.get('error')
  // 로그인 요청을 우리 앱이 보낸 게 맞는지 확인 (처음 화면이 열릴 때 한 번만 계산)
  const [stateOk] = useState(() => {
    const state = params.get('state')
    return state !== null && state === sessionStorage.getItem('kakaoState')
  })
  const [loginError, setLoginError] = useState<string | null>(null)

  const error = !code
    ? kakaoError === 'access_denied'
      ? '카카오 로그인이 취소되었어요'
      : '카카오 로그인 중 문제가 생겼어요. 다시 시도해 주세요'
    : !stateOk
      ? '잘못된 로그인 요청이에요. 다시 시도해 주세요'
      : loginError

  // 카카오 code는 한 번만 쓸 수 있어서, 개발 모드(StrictMode)에서 effect가 두 번 돌아도 한 번만 요청한다
  const requested = useRef(false)

  useEffect(() => {
    if (!code || !stateOk || requested.current) return
    requested.current = true
    sessionStorage.removeItem('kakaoState')

    loginWithKakao(code)
      .then((result) => navigate(nextRouteAfterLogin(result), { replace: true }))
      .catch((e: Error) => setLoginError(e.message))
  }, [code, stateOk, navigate])

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
