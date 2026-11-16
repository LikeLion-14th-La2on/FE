/**
 * 도토리 내역: 도토리 잔액 + 받은 배지 + 도토리 내역(acorn_ledger, 최신순)
 * (Figma 디자인 없음 — 마이페이지 카드 스타일에 맞춤)
 */
import clsx from 'clsx'
import { useNavigate } from 'react-router'

import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

type LedgerItem = {
  id: string
  /** 받으면 +, 쓰면 - */
  amount: number
  reason: string
  createdAt: string
}

type Badge = {
  id: string
  name: string
  emoji: string
}

// TODO: 도토리 내역 API 연결 후 교체 (서버가 내역을 최신순으로 준다)
const MOCK: { balance: number; ledger: LedgerItem[]; badges: Badge[] } = {
  balance: 30,
  ledger: [
    { id: '5', amount: 10, reason: '주식 2단계 완료', createdAt: '2026-11-17T09:12:00' },
    { id: '4', amount: -20, reason: '스트릭 보호권 구매', createdAt: '2026-11-16T21:40:00' },
    { id: '3', amount: 10, reason: '금융 기초 3단계 완료', createdAt: '2026-11-15T18:03:00' },
    { id: '2', amount: 20, reason: '5일 연속 학습', createdAt: '2026-11-14T08:30:00' },
    { id: '1', amount: 10, reason: '레벨 테스트 완료', createdAt: '2026-11-10T12:00:00' },
  ],
  badges: [
    { id: 'first-step', name: '첫 걸음', emoji: '🌱' },
    { id: 'streak-5', name: '5일 연속', emoji: '🔥' },
    { id: 'basic-clear', name: '기초 완주', emoji: '📘' },
  ],
}

/** '2026-11-17T09:12:00' → '11월 17일' */
function formatDate(iso: string) {
  const date = new Date(iso)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export default function AcornHistoryPage() {
  const navigate = useNavigate()
  const { balance, ledger, badges } = MOCK

  return (
    <>
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
            {badges.map(({ id, name, emoji }) => (
              <li key={id} className="flex flex-col items-center gap-1">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-full bg-coconut-100 text-[22px]"
                >
                  {emoji}
                </span>
                <span className="text-tag text-herb">{name}</span>
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
            {ledger.map(({ id, amount, reason, createdAt }) => (
              <li key={id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[14px] font-bold text-herb">{reason}</p>
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
