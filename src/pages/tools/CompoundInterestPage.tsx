/**
 * 복리 계산기: 처음 넣는 돈 · 연 이율 · 기간을 바꾸면 단리와 복리로 불어난 돈을 비교한다 (연 1회 복리)
 * - 결론 카드: 기간이 끝났을 때 복리로 받는 돈 + 단리보다 더 받는 돈
 * - 그래프: 해마다 불어나는 돈 (단리는 직선, 복리는 갈수록 가팔라지는 곡선)
 * - 방식별 카드: 받는 돈(막대 길이 = 복리 대비) + 이자
 * - 방식 이름(ⓘ)을 누르면 뜻 바텀시트 → 확인 / AI 튜터에게 물어보기
 * (Figma 디자인 없음 — 대출 상환 비교 화면 스타일에 맞춤)
 */
import clsx from 'clsx'
import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

type Method = 'compound' | 'simple'

/** 입력 범위 */
const PRINCIPAL = { min: 1_000_000, max: 100_000_000, step: 1_000_000 } // 100만 ~ 1억
const RATE = { min: 1, max: 10, step: 0.1 } // 연 1% ~ 10%
const YEARS = { min: 1, max: 30, step: 1 } // 1 ~ 30년

/** 방식별 이름 · 용어 id(AI 튜터 연결) · 뜻 · 그래프 색 */
const METHOD_INFO: Record<
  Method,
  { name: string; termId: string; meaning: string; line: string; dot: string }
> = {
  compound: {
    name: '복리',
    termId: 'compound',
    meaning:
      '원금뿐 아니라 그동안 붙은 이자에도 다시 이자가 붙는 방식이에요. 오래 둘수록 불어나는 속도가 빨라져요.',
    line: 'stroke-avocado-500',
    dot: 'bg-avocado-500',
  },
  simple: {
    name: '단리',
    termId: 'simple-interest',
    meaning:
      '처음 맡긴 원금에만 이자가 붙는 방식이에요. 해마다 같은 금액만큼 늘어나서, 오래 둬도 늘어나는 속도는 그대로예요.',
    line: 'stroke-apricot-600',
    dot: 'bg-apricot-600',
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

/** year년 뒤 받는 돈 (원금 + 이자) */
function amountAfter(method: Method, principal: number, ratePercent: number, year: number) {
  const r = ratePercent / 100
  return method === 'compound' ? principal * (1 + r) ** year : principal * (1 + r * year)
}

export default function CompoundInterestPage() {
  const navigate = useNavigate()
  const [principal, setPrincipal] = useState(10_000_000)
  const [rate, setRate] = useState(5)
  const [years, setYears] = useState(10)
  const [openMethod, setOpenMethod] = useState<Method | null>(null)

  const total: Record<Method, number> = {
    compound: amountAfter('compound', principal, rate, years),
    simple: amountAfter('simple', principal, rate, years),
  }
  const interest: Record<Method, number> = {
    compound: total.compound - principal,
    simple: total.simple - principal,
  }

  const subText: Record<Method, string> = {
    compound: `이자 ${formatWon(interest.compound)} · 이자에도 이자가 붙어요`,
    simple: `이자 ${formatWon(interest.simple)} · 원금에만 이자가 붙어요`,
  }

  /** 바텀시트 예시: 지금 입력한 값으로 첫해 · 둘째 해 이자를 보여준다 */
  const firstInterest = principal * (rate / 100)
  const exampleText: Record<Method, string> = {
    compound: `예) ${formatWon(principal)}을 연 ${rate.toFixed(1)}%로 두면 첫해 이자는 ${formatWon(firstInterest)}, 둘째 해에는 이자에도 이자가 붙어 ${formatWon(amountAfter('compound', principal, rate, 2) - amountAfter('compound', principal, rate, 1))}으로 늘어요`,
    simple: `예) ${formatWon(principal)}을 연 ${rate.toFixed(1)}%로 두면 해마다 똑같이 ${formatWon(firstInterest)}씩 이자가 붙어요`,
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
        <h1 className="text-[18px] font-bold text-herb">복리 계산기</h1>
      </header>

      {/* 입력 */}
      <section className="mt-[14px] flex flex-col gap-[14px] rounded-card bg-apricot-300 p-[18px]">
        <Slider
          label="처음 넣는 돈"
          display={formatWon(principal)}
          value={principal}
          {...PRINCIPAL}
          onChange={setPrincipal}
        />
        <Slider
          label="연 이율"
          display={`${rate.toFixed(1)}%`}
          value={rate}
          {...RATE}
          onChange={setRate}
        />
        <Slider label="기간" display={`${years}년`} value={years} {...YEARS} onChange={setYears} />
      </section>

      {/* 결론 */}
      <section className="mt-gap rounded-card bg-herb px-[18px] py-5 text-coconut-100">
        <p className="text-[13px] text-coconut-600">{years}년 뒤 복리로 받는 돈</p>
        <p className="mt-0.5 text-[20px] leading-[1.4] font-black">{formatWon(total.compound)}</p>
        <p className="mt-0.5 text-[13px] text-coconut-600">
          단리보다 {formatWon(total.compound - total.simple)} 더 받아요
        </p>
      </section>

      {/* 해마다 불어나는 돈 */}
      <section className="mt-gap rounded-card bg-coconut-100 p-[18px] shadow-[0_6px_0_var(--color-coconut-600)]">
        <h2 className="text-[15px] leading-[1.4] font-black text-herb">
          해마다 불어나는 돈{' '}
          <span className="text-sub font-bold text-herb-400">· 오래 둘수록 차이가 커져요</span>
        </h2>
        <GrowthChart principal={principal} rate={rate} years={years} />
        <ul className="mt-2 flex gap-4 text-sub text-herb-400">
          {(['compound', 'simple'] as Method[]).map((method) => (
            <li key={method} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className={clsx('h-[3px] w-3 rounded-full', METHOD_INFO[method].dot)}
              />
              {METHOD_INFO[method].name}
            </li>
          ))}
        </ul>
      </section>

      {/* 방식별 받는 돈 */}
      <section className="mt-[20px] rounded-card bg-avocado-200 p-[18px]">
        <h2 className="text-[15px] leading-[1.4] font-black text-herb">
          {years}년 뒤 받는 돈{' '}
          <span className="text-sub font-bold text-herb-400">· 연 1회 복리 기준</span>
        </h2>
        <ul className="mt-2.5 flex flex-col gap-2">
          {(['compound', 'simple'] as Method[]).map((method) => {
            const isMore = method === 'compound'
            return (
              <li
                key={method}
                className={clsx(
                  'rounded-[14px] bg-coconut-100 px-[14px] py-3',
                  isMore && 'ring-2 ring-avocado-500',
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
                    {isMore && (
                      <span className="rounded-full bg-avocado-500 px-[7px] text-tag text-coconut-100">
                        더 많아요
                      </span>
                    )}
                  </span>
                  <span className="text-[17px] font-black text-herb">
                    {formatWon(total[method])}
                  </span>
                </div>
                <div className="my-1.5 h-2 overflow-hidden rounded-full bg-avocado-100">
                  <div
                    className="h-full rounded-full bg-avocado-500"
                    style={{ width: `${(total[method] / total.compound) * 100}%` }}
                  />
                </div>
                <p className="text-sub font-normal text-herb-400">{subText[method]}</p>
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
        <BottomSheet open onClose={() => setOpenMethod(null)} labelledBy="compound-term-title">
          <h2 id="compound-term-title" className="text-title text-herb">
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

/**
 * 해마다 받는 돈 선 그래프 (0년 ~ years년)
 * - 세로축은 0원이 아니라 원금부터 시작해, 이자로 늘어난 부분이 잘 보이게 한다
 */
function GrowthChart({
  principal,
  rate,
  years,
}: {
  principal: number
  rate: number
  years: number
}) {
  const W = 300
  const H = 140
  const PAD = { top: 10, bottom: 22, left: 4, right: 4 }
  const top = amountAfter('compound', principal, rate, years)

  const x = (year: number) => PAD.left + (year / years) * (W - PAD.left - PAD.right)
  const y = (won: number) =>
    PAD.top + (1 - (won - principal) / (top - principal)) * (H - PAD.top - PAD.bottom)

  const points = (method: Method) =>
    Array.from(
      { length: years + 1 },
      (_, year) => `${x(year)},${y(amountAfter(method, principal, rate, year))}`,
    ).join(' ')

  const ticks = years === 1 ? [0, 1] : [0, Math.round(years / 2), years]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${years}년 동안 복리는 ${formatWon(top)}, 단리는 ${formatWon(amountAfter('simple', principal, rate, years))}까지 늘어나요`}
      className="mt-3 w-full"
    >
      {/* 바닥선 (원금) */}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={H - PAD.bottom}
        y2={H - PAD.bottom}
        className="stroke-coconut-600"
        strokeWidth={1}
      />
      {(['simple', 'compound'] as Method[]).map((method) => (
        <polyline
          key={method}
          points={points(method)}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={METHOD_INFO[method].line}
        />
      ))}
      {ticks.map((year) => (
        <text
          key={year}
          x={x(year)}
          y={H - 6}
          textAnchor={year === 0 ? 'start' : year === years ? 'end' : 'middle'}
          className="fill-coconut-700 text-[10px]"
        >
          {year}년
        </text>
      ))}
    </svg>
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
