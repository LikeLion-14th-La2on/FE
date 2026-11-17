/**
 * 대출 상환 비교: 대출 금액 · 연 금리 · 기간을 바꾸면 세 상환 방식의 총 이자를 바로 비교한다
 * - 결론 카드: 이자를 가장 적게 내는 방식 + 가장 많이 내는 방식과의 차이
 * - 방식별 카드: 총 이자(막대 길이 = 가장 많은 이자 대비) + 매달 내는 돈
 * - 방식 이름(ⓘ)을 누르면 뜻 바텀시트 → 확인 / AI 튜터에게 물어보기
 */
import clsx from 'clsx'
import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

type Method = 'equalPrincipal' | 'equalPayment' | 'bullet'

/** 입력 범위: [최소, 최대, 한 칸] */
const AMOUNT = { min: 10_000_000, max: 500_000_000, step: 10_000_000 } // 1천만 ~ 5억
const RATE = { min: 1, max: 10, step: 0.1 } // 연 1% ~ 10%
const MONTHS = { min: 6, max: 360, step: 6 } // 6개월 ~ 30년

/** 방식별 이름 · 용어 id(AI 튜터 연결) · 뜻 */
const METHOD_INFO: Record<Method, { name: string; termId: string; meaning: string }> = {
  equalPrincipal: {
    name: '원금균등',
    termId: 'equal-principal',
    meaning:
      '빌린 돈(원금)을 매달 똑같이 나눠 갚고, 남은 원금에 대한 이자를 더해 내는 방식이에요. 처음엔 많이 내고, 갈수록 내는 돈이 줄어요.',
  },
  equalPayment: {
    name: '원리금균등',
    termId: 'equal-payment',
    meaning:
      '원금과 이자를 합친 금액을 매달 똑같이 내는 방식이에요. 처음엔 이자 비중이 크고, 갈수록 원금 비중이 커져요.',
  },
  bullet: {
    name: '만기일시',
    termId: 'bullet-repayment',
    meaning:
      '빌리는 동안에는 이자만 내고, 마지막 달에 원금을 한 번에 갚는 방식이에요. 매달 부담은 적지만 이자는 가장 많이 내요.',
  },
}

/** 원 단위 금액 → '1억 5,000만 원' / '469만 원' / '9,000원' */
function formatWon(won: number) {
  const man = Math.round(won / 10_000)
  if (man === 0) return `${Math.round(won).toLocaleString()}원`
  const eok = Math.floor(man / 10_000)
  const rest = man % 10_000
  if (eok === 0) return `${rest.toLocaleString()}만 원`
  return rest === 0 ? `${eok}억 원` : `${eok}억 ${rest.toLocaleString()}만 원`
}

/** 세 방식의 총 이자와 매달 내는 돈 (월 이율 = 연 금리 ÷ 12) */
function calculate(amount: number, ratePercent: number, months: number) {
  const r = ratePercent / 100 / 12
  const principalPerMonth = amount / months

  // 원리금균등: 매달 같은 금액 = 원금 × r ÷ (1 - (1 + r)^-n)
  const payment = (amount * r) / (1 - (1 + r) ** -months)

  return {
    equalPrincipal: {
      totalInterest: (amount * r * (months + 1)) / 2,
      first: principalPerMonth + amount * r,
      last: principalPerMonth + principalPerMonth * r,
      firstInterest: amount * r,
      lastInterest: principalPerMonth * r,
      principalPerMonth,
    },
    equalPayment: {
      totalInterest: payment * months - amount,
      payment,
    },
    bullet: {
      totalInterest: amount * r * months,
      monthlyInterest: amount * r,
    },
  }
}

export default function LoanRepaymentPage() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState(100_000_000)
  const [rate, setRate] = useState(4.5)
  const [months, setMonths] = useState(24)
  const [openMethod, setOpenMethod] = useState<Method | null>(null)

  const result = calculate(amount, rate, months)

  // 총 이자가 적은 순서 (막대 길이는 가장 많은 이자를 100%로)
  const ranked = (Object.keys(METHOD_INFO) as Method[]).sort(
    (a, b) => result[a].totalInterest - result[b].totalInterest,
  )
  const best = ranked[0]
  const worst = ranked[ranked.length - 1]
  const maxInterest = result[worst].totalInterest

  /** 방식별 '매달 내는 돈' 한 줄 */
  const monthlyText: Record<Method, string> = {
    equalPrincipal: `매달 ${formatWon(result.equalPrincipal.first)} → ${formatWon(result.equalPrincipal.last)} (점점 줄어요)`,
    equalPayment: `매달 ${formatWon(result.equalPayment.payment)} (항상 같아요)`,
    bullet: `매달 이자 ${formatWon(result.bullet.monthlyInterest)} · 마지막 달 ${formatWon(amount)}`,
  }

  /** 바텀시트 예시: 지금 입력한 값으로 보여준다 */
  const exampleText: Record<Method, string> = {
    equalPrincipal: `예) ${formatWon(amount)}을 ${months}개월 → 원금은 매달 ${formatWon(result.equalPrincipal.principalPerMonth)}씩, 이자는 첫 달 ${formatWon(result.equalPrincipal.firstInterest)} → 마지막 달 ${formatWon(result.equalPrincipal.lastInterest)}으로 줄어요`,
    equalPayment: `예) ${formatWon(amount)}을 ${months}개월 → 매달 ${formatWon(result.equalPayment.payment)}씩 똑같이 갚아요`,
    bullet: `예) ${formatWon(amount)}을 ${months}개월 → 매달 이자 ${formatWon(result.bullet.monthlyInterest)}만 내다가, 마지막 달에 원금 ${formatWon(amount)}을 갚아요`,
  }

  return (
    <>
      <header className="flex items-center">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.tools)}
          className="flex h-10 w-8 items-center text-herb"
        >
          <BackIcon className="w-[19px]" />
        </button>
        <h1 className="text-[18px] font-bold text-herb">대출 상환 비교</h1>
      </header>

      {/* 입력 */}
      <section className="mt-[14px] flex flex-col gap-[14px] rounded-card bg-apricot-300 p-[18px]">
        <Slider
          label="대출 금액"
          display={formatWon(amount)}
          value={amount}
          {...AMOUNT}
          onChange={setAmount}
        />
        <Slider
          label="연 금리"
          display={`${rate.toFixed(1)}%`}
          value={rate}
          {...RATE}
          onChange={setRate}
        />
        <Slider
          label="기간"
          display={`${months}개월`}
          value={months}
          {...MONTHS}
          onChange={setMonths}
        />
      </section>

      {/* 결론 */}
      <section className="mt-gap rounded-card bg-herb px-[18px] py-5 text-coconut-100">
        <p className="text-[13px] text-coconut-600">이자를 가장 적게 내는 방식</p>
        <p className="mt-0.5 text-[20px] leading-[1.4] font-black">
          {METHOD_INFO[best].name} · 총 이자 {formatWon(result[best].totalInterest)}
        </p>
        <p className="mt-0.5 text-[13px] text-coconut-600">
          {METHOD_INFO[worst].name}보다{' '}
          {formatWon(result[worst].totalInterest - result[best].totalInterest)} 덜 내요
        </p>
      </section>

      {/* 방식별 총 이자 */}
      <section className="mt-gap rounded-card bg-avocado-200 p-[18px]">
        <h2 className="text-[15px] leading-[1.4] font-black text-herb">
          방식별 총 이자{' '}
          <span className="text-sub font-bold text-herb-400">· 막대가 짧을수록 이자가 적어요</span>
        </h2>
        <ul className="mt-2.5 flex flex-col gap-2">
          {ranked.map((method) => {
            const isBest = method === best
            const interest = result[method].totalInterest
            return (
              <li
                key={method}
                className={clsx(
                  'rounded-[14px] bg-coconut-100 px-[14px] py-3',
                  isBest && 'ring-2 ring-avocado-500',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOpenMethod(method)}
                      className="flex items-center gap-1 text-[14px] font-bold text-herb"
                    >
                      {METHOD_INFO[method].name}
                      <InfoIcon className="size-[14px]" />
                      <span className="sr-only">뜻 보기</span>
                    </button>
                    {isBest && (
                      <span className="rounded-full bg-avocado-500 px-[7px] text-tag text-coconut-100">
                        최저
                      </span>
                    )}
                  </span>
                  <span className="text-[17px] font-black text-herb">{formatWon(interest)}</span>
                </div>
                <div className="my-1.5 h-2 overflow-hidden rounded-full bg-avocado-100">
                  <div
                    className="h-full rounded-full bg-avocado-500"
                    style={{ width: `${(interest / maxInterest) * 100}%` }}
                  />
                </div>
                <p className="text-sub font-normal text-herb-400">{monthlyText[method]}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="mt-4 pb-2 text-center text-sub leading-[1.7] text-coconut-700">
        <span className="inline-flex items-center gap-1">
          <InfoIcon className="size-[12px]" />
          용어를 누르면 뜻을 볼 수 있어요
        </span>
        <br />
        실제 금융기관 조건과 다를 수 있어요
      </p>

      {openMethod && (
        <BottomSheet open onClose={() => setOpenMethod(null)} labelledBy="loan-term-title">
          <h2 id="loan-term-title" className="text-title text-herb">
            {METHOD_INFO[openMethod].name}
          </h2>
          <p className="text-body break-keep text-herb-400">{METHOD_INFO[openMethod].meaning}</p>
          <p className="rounded-[14px] bg-avocado-100 px-[14px] py-3 text-[13px] leading-[1.5] break-keep text-avocado-700">
            {exampleText[openMethod]}
          </p>
          <div className="mt-2 flex gap-2">
            {/* flex-basis가 Button의 w-full보다 우선해서 확인 버튼은 96px로 고정된다 */}
            <Button
              variant="secondary"
              className="flex-[0_0_96px]"
              onClick={() => setOpenMethod(null)}
            >
              확인
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate(ROUTES.aiTutor(METHOD_INFO[openMethod].termId))}
            >
              AI 튜터에게 물어보기
            </Button>
          </div>
        </BottomSheet>
      )}
    </>
  )
}

/** 이름 · 값 한 줄 + 아래 슬라이더 (채운 부분은 apricot-700, 나머지는 coconut-200) */
function Slider({
  label,
  display,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  display: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <label className="block">
      <span className="flex items-center justify-between text-herb">
        <span className="text-[14px] font-medium">{label}</span>
        <span className="text-[15px] font-bold">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        // 채운 비율을 CSS 변수로 넘겨 트랙 그라디언트에 쓴다
        style={{ '--fill': `${percent}%` } as CSSProperties}
        className={clsx(
          // 입력 칸은 24px로 키워 손가락으로 잡기 쉽게, 보이는 트랙(8px)은 가상 요소로 그린다
          'mt-1 block h-6 w-full cursor-pointer touch-pan-y appearance-none bg-transparent',
          '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-apricot-700)_var(--fill),var(--color-coconut-200)_var(--fill))]',
          '[&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:size-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-apricot-700 [&::-webkit-slider-thumb]:bg-coconut-100',
          '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[linear-gradient(to_right,var(--color-apricot-700)_var(--fill),var(--color-coconut-200)_var(--fill))]',
          '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-apricot-700 [&::-moz-range-thumb]:bg-coconut-100',
        )}
      />
    </label>
  )
}

/** ⓘ 아이콘 */
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden className={className}>
      <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
      <circle cx="6" cy="3.6" r="0.75" fill="currentColor" />
      <path d="M6 5.4v3.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}
