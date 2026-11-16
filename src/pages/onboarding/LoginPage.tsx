/** 로그인: 캐릭터 + 서비스 소개 + 카카오로 시작하기 */
import { kakaoAuthorizeUrl } from '@/api/auth'
import squirrel from '@/assets/squirrel.webp'

export default function LoginPage() {
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
