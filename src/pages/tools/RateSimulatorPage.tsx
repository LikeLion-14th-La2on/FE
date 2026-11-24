/**
 * 금리 변동 시뮬레이터: 변동금리 대출에서 금리가 오르내리면 매달 내는 돈과 총 이자가 얼마나 달라지는지 본다
 * - 입력: 대출 금액 · 지금 금리 · 기간 · 금리 변동폭(-3%p ~ +3%p). 슬라이더 또는 직접 입력
 * - 계산: 원리금균등상환 기준, 바뀐 금리가 처음부터 끝까지 그대로 간다고 가정
 * - 결론 카드: 매달 얼마 더(덜) 내는지 + 총 이자 차이
 * - 비교 카드: 지금 금리 vs 바뀐 금리 (막대 길이 = 둘 중 큰 총 이자 대비)
 * - 금리별 표: 지금 금리에서 -1%p ~ +3%p일 때 매달 내는 돈 (금리 1%p의 무게를 한눈에)
 * - 용어(변동금리 · 고정금리) ⓘ → 뜻 바텀시트 → 확인 / AI 튜터에게 물어보기
 * - 입력값 불러오기 · 자동 저장 (GET · PUT /tools/conditions, toolType RATE_CHANGE)
 * (Figma 디자인 없음 — 대출 상환 비교 화면 스타일에 맞춤)
 */
import clsx from 'clsx'
import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { toSavedValue, useToolConditions } from '@/hooks/useToolConditions'
import { ROUTES } from '@/router/routes'

type Term = 'variable' | 'fixed'

/** 입력 범위: [최소, 최대, 한 칸] */
const AMOUNT = { min: 10_000_000, max: 500_000_000, step: 10_000_000 } // 1천만 ~ 5억
const RATE = { min: 1, max: 10, step: 0.1 } // 연 1% ~ 10%
const MONTHS = { min: 6, max: 360, step: 6 } // 6개월 ~ 30년
const CHANGE = { min: -3, max: 3, step: 0.25 } // 금리 변동폭 -3%p ~ +3%p (기준금리는 보통 0.25%p씩 움직인다)

/** 금리별 표에 보여 줄 변동폭 */
const TABLE_CHANGES = [-1, 0, 1, 2, 3]

/**
 * 용어 이름 · 서버 용어 번호(AI 튜터 연결) · 뜻
 * - 서버 용어 번호: 변동금리 31 · 고정금리 30 (null이면 AI 튜터 버튼 숨김)
 */
const TERM_INFO: Record<Term, { name: string; termId: number | null; meaning: string }> = {
  variable: {
    name: '변동금리',
    termId: 31,
    meaning:
      '대출 기간 동안 시장 금리(기준금리 등)에 따라 정해진 때마다 금리가 바뀌는 방식이에요. 금리가 내리면 이자가 줄지만, 오르면 매달 내는 돈이 늘어나요.',
  },
  fixed: {
    name: '고정금리',
    termId: 30,
    meaning:
      '처음 정한 금리가 대출 기간 내내 그대로인 방식이에요. 시장 금리가 올라도 내는 돈이 같지만, 보통 변동금리보다 처음 금리가 조금 높아요.',
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

/** 금리 숫자 → '4.5%' (소수 둘째 자리까지, 끝의 0은 뺀다) */
const formatRate = (rate: number) => `${Number(rate.toFixed(2))}%`

/** 변동폭 → '+1%p' / '-0.5%p' / '0%p' */
const formatChange = (change: number) => `${change > 0 ? '+' : ''}${Number(change.toFixed(2))}%p`

/** 원리금균등: 매달 내는 돈 · 총 이자 (금리가 0% 이하면 원금만 나눠 낸다) */
function repay(amount: number, ratePercent: number, months: number) {
  const r = Math.max(ratePercent, 0) / 100 / 12
  const payment = r === 0 ? amount / months : (amount * r) / (1 - (1 + r) ** -months)
  return { payment, totalInterest: payment * months - amount }
}

export default function RateSimulatorPage() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState(100_000_000)
  const [rate, setRate] = useState(4.5)
  const [months, setMonths] = useState(360)
  const [change, setChange] = useState(1)
  const [openTerm, setOpenTerm] = useState<Term | null>(null)
  const touched = useToolConditions(
    'RATE_CHANGE',
    { principal: amount, rate, months, rateChange: change },
    (saved) => {
      setAmount(toSavedValue(saved.principal, AMOUNT, amount))
      setRate(toSavedValue(saved.rate, RATE, rate))
      setMonths(toSavedValue(saved.months, MONTHS, months))
      setChange(toSavedValue(saved.rateChange, CHANGE, change))
    },
  )

  const newRate = Math.max(rate + change, 0)
  const now = repay(amount, rate, months)
  const after = repay(amount, newRate, months)
  const monthlyDiff = after.payment - now.payment
  const interestDiff = after.totalInterest - now.totalInterest
  const maxInterest = Math.max(now.totalInterest, after.totalInterest, 1)

  const rows = [
    { key: 'now', label: '지금 금리', rate, result: now },
    { key: 'after', label: `${formatChange(change)} 바뀌면`, rate: newRate, result: after },
  ]

  /** 결론 한 줄: 오르면 '더', 내리면 '덜' */
  const headline =
    Math.abs(monthlyDiff) < 1
      ? '매달 내는 돈이 그대로예요'
      : `매달 ${formatWon(Math.abs(monthlyDiff))} ${monthlyDiff > 0 ? '더' : '덜'} 내요`

  /** 바텀시트 예시: 지금 입력한 값으로 */
  const exampleText: Record<Term, string> = {
    variable: `예) ${formatWon(amount)}을 ${months}개월, 연 ${formatRate(rate)}로 빌렸는데 금리가 ${formatChange(change)} 바뀌면 매달 ${formatWon(now.payment)} → ${formatWon(after.payment)}`,
    fixed: `예) ${formatWon(amount)}을 ${months}개월, 연 ${formatRate(rate)} 고정으로 빌리면 시장 금리가 바뀌어도 매달 ${formatWon(now.payment)}으로 같아요`,
  }

  const onChangeOf = (set: (v: number) => void) => (v: number) => {
    touched()
    set(v)
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
        <h1 className="text-[18px] font-bold text-herb">금리 변동 시뮬레이터</h1>
      </header>

      {/* 입력 */}
      <section className="mt-[14px] flex flex-col gap-[14px] rounded-card bg-herb-100 p-[18px]">
        <Slider
          label="대출 금액"
          display={formatWon(amount)}
          value={amount}
          {...AMOUNT}
          unit={{ scale: 10_000, suffix: '만 원', decimals: 0 }}
          onChange={onChangeOf(setAmount)}
        />
        <Slider
          label="지금 금리"
          display={formatRate(rate)}
          value={rate}
          {...RATE}
          unit={{ scale: 1, suffix: '%', decimals: 2 }}
          onChange={onChangeOf(setRate)}
        />
        <Slider
          label="기간"
          display={`${months}개월`}
          value={months}
          {...MONTHS}
          unit={{ scale: 1, suffix: '개월', decimals: 0 }}
          onChange={onChangeOf(setMonths)}
        />
        <Slider
          label="금리 변동"
          display={`${formatChange(change)} → ${formatRate(newRate)}`}
          value={change}
          {...CHANGE}
          unit={{ scale: 1, suffix: '%p', decimals: 2 }}
          onChange={onChangeOf(setChange)}
        />
      </section>

      {/* 결론 */}
      <section className="mt-gap rounded-card bg-herb px-[18px] py-5 text-coconut-100">
        <p className="text-[13px] text-coconut-600">
          금리가 {formatChange(change)} {change >= 0 ? '오르면' : '내리면'}
        </p>
        <p className="mt-0.5 text-[20px] leading-[1.4] font-black">{headline}</p>
        <p className="mt-0.5 text-[13px] text-coconut-600">
          총 이자는 {formatWon(Math.abs(interestDiff))} {interestDiff >= 0 ? '늘어나요' : '줄어요'}
        </p>
      </section>

      {/* 지금 vs 바뀐 금리 */}
      <section className="mt-gap rounded-card bg-avocado-200 p-[18px]">
        <h2 className="text-[15px] leading-[1.4] font-black text-herb">
          <button
            type="button"
            onClick={() => setOpenTerm('variable')}
            className="inline-flex items-center gap-1"
          >
            변동금리
            <InfoIcon className="size-[14px]" />
            <span className="sr-only">뜻 보기</span>
          </button>{' '}
          총 이자 비교
        </h2>
        <ul className="mt-2.5 flex flex-col gap-2">
          {rows.map(({ key, label, rate: rowRate, result }) => (
            <li key={key} className="rounded-[14px] bg-coconut-100 px-[14px] py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-bold text-herb">
                  {label} <span className="font-medium text-herb-400">· {formatRate(rowRate)}</span>
                </span>
                <span className="text-[17px] font-black text-herb">
                  {formatWon(result.totalInterest)}
                </span>
              </div>
              <div className="my-1.5 h-2 overflow-hidden rounded-full bg-avocado-100">
                <div
                  className={clsx(
                    'h-full rounded-full',
                    key === 'after' && change > 0 ? 'bg-burnt-orange-500' : 'bg-avocado-500',
                  )}
                  style={{ width: `${(result.totalInterest / maxInterest) * 100}%` }}
                />
              </div>
              <p className="text-sub font-normal text-herb-400">매달 {formatWon(result.payment)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2.5 text-sub text-herb-400">
          금리가 안 바뀌는{' '}
          <button
            type="button"
            onClick={() => setOpenTerm('fixed')}
            className="inline-flex items-center gap-0.5 font-bold text-herb"
          >
            고정금리
            <InfoIcon className="size-[12px]" />
            <span className="sr-only">뜻 보기</span>
          </button>
          라면 매달 {formatWon(now.payment)}으로 그대로예요
        </p>
      </section>

      {/* 금리별 매달 내는 돈 */}
      <section className="mt-gap rounded-card bg-coconut-100 p-[18px] shadow-card">
        <h2 className="text-[15px] leading-[1.4] font-black text-herb">
          금리별 매달 내는 돈{' '}
          <span className="text-sub font-bold text-herb-400">· 지금 금리 기준</span>
        </h2>
        <table className="mt-2 w-full text-[14px] text-herb">
          <tbody>
            {TABLE_CHANGES.map((c) => {
              const r = Math.max(rate + c, 0)
              const { payment } = repay(amount, r, months)
              const diff = payment - now.payment
              return (
                <tr key={c} className={clsx('border-t border-herb-100', c === 0 && 'font-bold')}>
                  <td className="py-2">
                    {c === 0 ? '지금' : formatChange(c)}{' '}
                    <span className="text-herb-400">· {formatRate(r)}</span>
                  </td>
                  <td className="py-2 text-right">{formatWon(payment)}</td>
                  <td
                    className={clsx(
                      'w-[76px] py-2 text-right text-sub',
                      diff > 0 ? 'text-burnt-orange-600' : 'text-avocado-500',
                    )}
                  >
                    {c === 0 ? '' : `${diff > 0 ? '+' : '-'}${formatWon(Math.abs(diff))}`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <p className="mt-4 pb-2 text-center text-sub leading-[1.7] text-coconut-700">
        원리금균등상환 · 바뀐 금리가 끝까지 간다고 가정
        <br />
        실제 금융기관 조건과 다를 수 있어요
      </p>

      {openTerm && (
        <BottomSheet open onClose={() => setOpenTerm(null)} labelledBy="rate-term-title">
          <h2 id="rate-term-title" className="text-title text-herb">
            {TERM_INFO[openTerm].name}
          </h2>
          <p className="text-body break-keep text-herb-400">{TERM_INFO[openTerm].meaning}</p>
          <p className="rounded-[14px] bg-avocado-100 px-[14px] py-3 text-[13px] leading-[1.5] break-keep text-avocado-700">
            {exampleText[openTerm]}
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              // AI 튜터 버튼이 있으면 96px, 없으면(서버에 없는 용어) 혼자 꽉 채운다
              className={TERM_INFO[openTerm].termId === null ? 'flex-1' : 'flex-[0_0_96px]'}
              onClick={() => setOpenTerm(null)}
            >
              확인
            </Button>
            {TERM_INFO[openTerm].termId !== null && (
              <Button
                className="flex-1"
                onClick={() => navigate(ROUTES.aiTutor(String(TERM_INFO[openTerm].termId)))}
              >
                AI 튜터에게 물어보기
              </Button>
            )}
          </div>
        </BottomSheet>
      )}
    </>
  )
}

/**
 * 이름 · 값 한 줄 + 아래 슬라이더 (채운 부분은 apricot-700, 나머지는 coconut-200)
 * - 값(✎ 아이콘)을 누르면 숫자 입력칸으로 바뀌어 직접 입력할 수 있다 (Enter 또는 칸 밖을 누르면 적용, Esc는 취소)
 * - 입력은 unit 단위로 받는다 (예: 금액은 만 원 단위), 범위를 넘으면 최소 · 최대로 맞춘다
 * - 최소가 음수인 슬라이더(금리 변동폭)는 직접 입력에서 '-'도 받는다
 */
function Slider({
  label,
  display,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  display: string
  value: number
  min: number
  max: number
  step: number
  /** 직접 입력 단위: scale(입력 1 = 실제 값 scale) · 칸 뒤 글자 · 소수 자리 */
  unit: { scale: number; suffix: string; decimals: number }
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const percent = ((value - min) / (max - min)) * 100

  const startEdit = () => setDraft(String(Number((value / unit.scale).toFixed(unit.decimals))))
  const commit = () => {
    if (draft === null) return
    const typed = Number(draft.replace(/,/g, ''))
    if (draft.trim() !== '' && Number.isFinite(typed)) {
      const rounded = Number(typed.toFixed(unit.decimals)) * unit.scale
      onChange(Math.min(Math.max(rounded, min), max))
    }
    setDraft(null)
  }

  return (
    <div>
      <div className="flex h-8 items-center justify-between text-herb">
        <span className="text-[14px] font-medium">{label}</span>
        {draft === null ? (
          <button
            type="button"
            onClick={startEdit}
            aria-label={`${label} ${display}, 눌러서 직접 입력`}
            className="flex items-center gap-1 text-[15px] font-bold"
          >
            {display}
            <PencilIcon className="size-[14px] text-apricot-700" />
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[15px] font-bold">
            <input
              // 숫자 키패드 (소수점 있는 값만 소수점 키)
              inputMode={unit.decimals > 0 ? 'decimal' : 'numeric'}
              aria-label={`${label} (${unit.suffix})`}
              autoFocus
              value={draft}
              onChange={(e) =>
                setDraft(e.target.value.replace(min < 0 ? /[^\d.,-]/g : /[^\d.,]/g, ''))
              }
              onFocus={(e) => e.target.select()}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') setDraft(null)
              }}
              className="h-8 w-24 rounded-lg bg-coconut-100 px-2 text-right outline-2 outline-apricot-700"
            />
            {unit.suffix}
          </span>
        )}
      </div>
      <input
        type="range"
        aria-label={label}
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
    </div>
  )
}

/** ✎ 연필 아이콘 (직접 입력할 수 있는 값 옆, 색이 채워진 모양) */
function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      {/* 몸통 + 연필심 (지우개 쪽과는 1px 틈으로 나눈다) */}
      <path d="M9.6 3.4l3 3-7.4 7.4-3.6.9a.4.4 0 0 1-.5-.5l.9-3.6z" />
      <path d="M10.7 2.3l1.1-1.1a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2l-1.1 1.1z" />
    </svg>
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
