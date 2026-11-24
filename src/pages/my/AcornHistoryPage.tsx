/**
 * 도토리 내역: 도토리 잔액 + 받은 배지 + 도토리 내역(acorn_ledger, 최신순)
 * - 보상 조회(GET /users/me/rewards) 한 번으로 셋 다 받는다
 * - 내역 사유는 서버 코드(DAILY_STUDY 등)로 와서 화면 문구로 바꾼다
 * (Figma 디자인 없음 — 마이페이지 카드 스타일에 맞춤)
 */
import clsx from 'clsx'
import { useNavigate } from 'react-router'

import { getRewards } from '@/api/user'
import { LoadError, Loading } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { useApi } from '@/hooks/useApi'
import { ROUTES } from '@/router/routes'

/**
 * 내역 사유 코드 → 화면 문구 (명세에 나온 코드만, 모르는 코드는 받음 · 사용으로)
 * TODO: 백엔드에 사유 코드 전체 목록 받으면 채우기
 */
const REASON_LABEL: Record<string, string> = {
  DAILY_STUDY: '오늘 학습 완료',
  AI_TUTOR: 'AI 튜터 질문',
  STREAK_SHIELD: '스트릭 보호권 구매',
  CHARACTER: '캐릭터 구매',
}

const reasonText = (reason: string, amount: number) =>
  REASON_LABEL[reason] ?? (amount > 0 ? '도토리 받음' : '도토리 사용')

/** '2026-11-17T09:12:00+09:00' → '11월 17일' */
function formatDate(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export default function AcornHistoryPage() {
  const rewards = useApi(getRewards, 'rewards')

  if (rewards.status === 'loading')
    return (
      <>
        <Header />
        <Loading label="도토리 내역을 불러오고 있어요" />
      </>
    )
  if (rewards.status === 'error')
    return (
      <>
        <Header />
        <LoadError message={rewards.error.message} onRetry={rewards.reload} />
      </>
    )

  const { acornBalance: balance, acornHistory: ledger, badges } = rewards.data

  return (
    <>
      <Header />

      {/* 잔액 */}
      <section className="mt-[18px] flex h-24 flex-col justify-center rounded-card bg-apricot-600 px-gutter shadow-[0_4px_12px_rgb(0_0_0/0.05)]">
        <p className="text-sub text-apricot-200">내 도토리</p>
        <p className="text-[28px] leading-[1.3] font-bold text-coconut-100">
          <span aria-hidden>🌰</span> {balance}
        </p>
      </section>

      {/* 받은 배지 */}
      <section className="mt-gap rounded-card bg-avocado-100 p-4">
        <h2 className="text-[17px] leading-[1.4] font-black text-herb">받은 배지</h2>
        {badges.length > 0 ? (
          <ul className="mt-3 grid grid-cols-4 gap-2">
            {badges.map(({ badgeId, name, imageUrl }) => (
              <li key={badgeId} className="flex flex-col items-center gap-1">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-coconut-100 text-[22px]"
                >
                  {/* 배지 이미지가 없으면 메달로 */}
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="size-9 object-contain" />
                  ) : (
                    '🏅'
                  )}
                </span>
                <span className="text-center text-tag break-keep text-herb">{name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-body text-herb-300">아직 받은 배지가 없어요</p>
        )}
      </section>

      {/* 내역 (최신순) */}
      <section className="mt-gap rounded-card bg-coconut-100 p-4 shadow-[0_6px_0_var(--color-coconut-600)]">
        <h2 className="text-[17px] leading-[1.4] font-black text-herb">내역</h2>
        {ledger.length > 0 ? (
          <ul className="mt-1 divide-y divide-avocado-100">
            {ledger.map(({ amount, reason, createdAt }, i) => (
              // 내역에는 id가 없어서 시각 + 순서로 구분한다
              <li key={`${createdAt}-${i}`} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[14px] font-bold text-herb">{reasonText(reason, amount)}</p>
                  <p className="text-sub text-herb-300">{formatDate(createdAt)}</p>
                </div>
                <p
                  className={clsx(
                    'text-[15px] font-bold',
                    amount > 0 ? 'text-avocado-500' : 'text-burnt-orange-500',
                  )}
                >
                  {amount > 0 ? `+${amount}` : amount}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-body text-herb-300">아직 도토리 내역이 없어요</p>
        )}
      </section>
    </>
  )
}

/** 위쪽 제목 줄 (불러오는 중 · 오류 화면에도 보여 준다) */
function Header() {
  const navigate = useNavigate()
  return (
    <header className="flex items-center">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => navigate(ROUTES.my)}
        className="flex h-10 w-8 items-center text-herb"
      >
        <BackIcon className="w-[19px]" />
      </button>
      <h1 className="text-[18px] font-bold text-herb">도토리 내역</h1>
    </header>
  )
}
