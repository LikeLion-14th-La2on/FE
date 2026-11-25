/**
 * 나무 수확: 나무가 다 자란 날(단계 완수 응답 treeCompleted) 단계 완수 화면에서 넘어오는 화면
 * - 위 카드: 다 자란 나무 + 꼭대기의 다람쥐 + 수확 보너스
 * - 아래 카드: 이어서 키울 나무 (같은 계절이면 같은 계절 나무, 다람쥐는 맨 아래에서 다시 시작)
 * Figma 975 → 390 (÷2.5)
 */
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'

import acorn0 from '@/assets/acorn/acorn-0.svg'
import acorn15 from '@/assets/acorn/acorn-15.svg'
import acorn45 from '@/assets/acorn/acorn-45.svg'
import acornM15 from '@/assets/acorn/acorn-m15.svg'
import acornM30 from '@/assets/acorn/acorn-m30.svg'
import { Card, Character } from '@/components/common'
import { ACORNS_PER_TREE, getSeason, HARVEST_BONUS, toOrdinal } from '@/constants/tree'
import { ROUTES } from '@/router/routes'

/**
 * 단계 완수 화면이 단계 완수 응답에서 넘겨주는 값
 * - 수확 보너스가 더해진 도토리 · 연속 학습일
 * - treeCount(몇 번째 나무) · treeBonus(보너스 도토리)는 백엔드 추가 예정이라, 없으면 기본값
 */
export type HarvestState = {
  acornBalance: number
  streak: number
  treeCount?: number
  treeBonus?: number
}

// 주소로 바로 들어왔을 때(state 없음) 보여 줄 값
const FALLBACK: HarvestState = { acornBalance: 0, streak: 0 }

/** 도토리 7자리 (나무 이미지 기준 %, 홈 배치와 같은 기준) + 바깥쪽일수록 바깥으로 기운 도토리 */
const ACORN_SPOTS = [
  { left: 40.0, top: 22.7, src: acornM15 },
  { left: 54.3, top: 47.2, src: acorn15 },
  { left: 31.4, top: 43.8, src: acornM15 },
  { left: 66.3, top: 31.8, src: acorn45 },
  { left: 53.1, top: 8.5, src: acorn0 },
  { left: 26.3, top: 9.1, src: acornM30 },
  { left: 19.4, top: 29.0, src: acornM30 },
]
const ACORN_SIZE = 17.7 // 나무 폭 대비 %

export default function HarvestPage() {
  const navigate = useNavigate()
  const {
    acornBalance,
    streak,
    treeCount = 1,
    treeBonus = HARVEST_BONUS,
  } = (useLocation().state as HarvestState | null) ?? FALLBACK
  // 같은 계절 안에서는 같은 계절 나무: 수확한 나무도, 이어서 키울 나무도 지금 계절
  const season = getSeason()

  return (
    <div className="flex flex-col gap-gap">
      <header className="flex items-center justify-between">
        <h1 className="text-[24px] font-black text-herb">도토리치</h1>
        <div className="flex gap-[6px]">
          <Chip className="bg-apricot-200 text-apricot-700" icon="🔥" label="연속 학습">
            {streak}
          </Chip>
          <Chip className="bg-avocado-200 text-avocado-500" icon="🌰" label="도토리">
            {acornBalance}
          </Chip>
        </div>
      </header>

      {/* 수확한 나무 */}
      <section className="rounded-[24px] bg-apricot-200 px-gutter pt-[22px] pb-7 shadow-[0_6px_0_var(--color-apricot-300)]">
        <h2 className="text-center text-[20px] font-black text-apricot-700">
          <span aria-hidden>🎉</span> {toOrdinal(treeCount)} 나무 수확!
        </h2>

        <div className="relative mx-auto mt-4 w-[216px]">
          <img src={season.image} alt={`${season.name} 나무`} className="w-full" />
          {ACORN_SPOTS.map(({ left, top, src }, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="absolute"
              style={{ left: `${left}%`, top: `${top}%`, width: `${ACORN_SIZE}%` }}
            />
          ))}
          {/* 다람쥐: 꼭대기 (TODO: 장착한 캐릭터로 교체) */}
          {/* Character는 자체가 relative라, 위치는 감싼 칸으로 잡는다 */}
          <div className="absolute -top-5 right-[16px]">
            <Character width={46} />
          </div>
        </div>

        {/* 홈 '학습 시작' 버튼처럼 아래 그림자 + 누르면 눌림, 받고 나면 홈으로 */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.home, { replace: true })}
          className="mx-auto mt-6 flex h-[43px] w-fit items-center gap-1.5 rounded-[14px] bg-coconut-100 px-5 text-[18px] font-black text-apricot-700 shadow-[0_4px_0_var(--color-coconut-600)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-none"
        >
          <span aria-hidden>🌰</span>+{treeBonus} 도토리 획득
        </button>
        <p className="mt-3 text-center text-[15px] font-medium text-herb-300">
          다람쥐가 꼭대기에 닿았어요
        </p>
      </section>

      {/* 다음 나무 */}
      <Card className="px-gutter pt-5 pb-6">
        <h2 className="text-center text-[17px] font-bold text-herb">
          다음 나무도 {season.name} <span aria-hidden>{season.emoji}</span>
        </h2>
        <div className="relative mx-auto mt-3 w-[160px]">
          <img src={season.image} alt={`${season.name} 나무`} className="w-full" />
          {/* 다람쥐: 줄기 맨 아래에서 다시 시작 */}
          <div className="absolute right-[30px] bottom-0">
            <Character width={34} />
          </div>
        </div>
        <p className="mt-3 text-center text-sub text-herb-300">
          내일부터 도토리 {ACORNS_PER_TREE}개를 다시 모아요
        </p>
      </Card>
    </div>
  )
}

/** 상단 알약형 칩 (홈과 같은 모양) */
function Chip({
  className,
  icon,
  label,
  children,
}: {
  className: string
  icon: string
  label: string
  children: ReactNode
}) {
  return (
    <span
      aria-label={`${label} ${children}`}
      className={clsx(
        'flex h-[29px] items-center gap-1 rounded-full px-3 text-[13px] font-bold',
        className,
      )}
    >
      <span aria-hidden>{icon}</span>
      {children}
    </span>
  )
}
