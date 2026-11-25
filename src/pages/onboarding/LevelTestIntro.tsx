/** 레벨 테스트 안내: 닉네임 입력 직후, 레벨 테스트를 시작하기 전에 보여주는 화면 */
import { useLocation, useNavigate } from 'react-router'

import { getMe } from '@/api/user'
import squirrelCheer from '@/assets/squirrel-cheer.webp'
import { Button } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { useApi } from '@/hooks/useApi'
import { ROUTES } from '@/router/routes'

const GUIDES = [
  '📈 주식 · 🏠 생활 금융 · 📘 금융 기초',
  '각 섹터에서 6문제씩 나와요',
  "모르는 문제는 '잘 모르겠어요'를 눌러주세요",
]

export default function LevelTestIntroPage() {
  const navigate = useNavigate()
  // 닉네임 화면에서 넘겨받은 값을 먼저 쓰고, 없으면(새로고침 · 로그인 후 바로 온 경우) 내 정보에서 가져온다
  const passed = (useLocation().state as { nickname?: string } | null)?.nickname
  const me = useApi(getMe, 'me')
  const nickname = passed ?? me.data?.nickname

  return (
    <>
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => navigate(ROUTES.nickname, { replace: true })}
        className="flex h-10 w-10 items-center text-herb"
      >
        <BackIcon className="w-[19px]" />
      </button>

      {/* mt-auto: 화면이 길어져도 안내 문구·다람쥐가 버튼 쪽에 붙어 있게 한다 */}
      <h1 className="mt-auto text-center text-question text-herb">
        환영해요!
        <br />
        지금부터 {nickname ? `${nickname} 님의` : '나의'}
        <br />
        금융 레벨을 확인할게요!
      </h1>

      {/* Figma 40px → 16px, 줄간격 56 → 22.4px (1.4) */}
      <div className="mt-gap text-center text-[16px] leading-[1.4] text-avocado-500">
        <p>18문제를 통해 나에게 맞는 단계가 어디인지 확인해요</p>
        <ul>
          {GUIDES.map((guide) => (
            <li key={guide}>✓ {guide}</li>
          ))}
        </ul>
      </div>

      {/* 화이팅 다람쥐: 기존 그림과 같은 높이(218)로 맞춰 배치가 바뀌지 않게 */}
      <img src={squirrelCheer} alt="" className="mx-auto mt-[62px] h-[218px] w-auto" />

      <Button
        className="mt-14 enabled:bg-avocado-500 enabled:shadow-[0_4px_0_var(--color-avocado-700)]"
        onClick={() => navigate(ROUTES.levelTest, { replace: true })}
      >
        레벨 테스트 시작하기
      </Button>
    </>
  )
}
