/** 로그인: 캐릭터 + 서비스 소개 + 카카오로 시작하기 */
import { kakaoAuthorizeUrl } from '@/api/auth'
import squirrel from '@/assets/squirrel.webp'

export default function LoginPage() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-app bg-apricot-700">
      <main className="flex min-h-dvh flex-col px-gutter pt-gutter pb-[calc(var(--spacing-gutter)+env(safe-area-inset-bottom))]">
        <div className="flex flex-1 flex-col items-center justify-center gap-gap">
          {/* Figma 단계 완수 화면의 3D 다람쥐(배경 투명) + 바닥 그림자 */}
          <div className="flex flex-col items-center">
            <img src={squirrel} alt="다람쥐 캐릭터" className="w-[170px]" />
            <div className="-mt-3 h-4 w-[110px] rounded-full bg-apricot-800/40" aria-hidden />
          </div>
          <h1 className="pt-2 text-5xl font-black text-coconut-100">도토리치</h1>
          <p className="text-body text-coconut-200">하루 5문제, 도토리처럼 쌓는 금융 상식</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => window.location.assign(kakaoAuthorizeUrl())}
            className="h-btn w-full rounded-card bg-kakao text-card-title text-kakao-label shadow-btn-kakao transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-none"
          >
            카카오로 3초 만에 시작하기
          </button>
          <p className="text-center text-sub text-apricot-200">시작하면 약관에 동의하게 됩니다</p>
        </div>
      </main>
    </div>
  )
}
