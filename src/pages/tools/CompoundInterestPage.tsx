/**
 * 복리 계산기: 처음 넣는 돈 · 매달 넣는 돈 · 연 이율 · 기간을 바꾸면(슬라이더 또는 직접 입력)
 * 단리와 복리로 불어난 돈을 비교한다
 * - 계산: 연 이율 기준 월 복리, 매달 초에 적립, 세전(이자소득세 미반영)
 * - 결론 카드: 기간이 끝났을 때 복리로 받는 돈 + 넣은 돈 합계 + 단리보다 더 받는 돈
 * - 그래프: 해마다 불어나는 돈 (단리는 거의 직선, 복리는 갈수록 가팔라지는 곡선)
 * - 방식별 카드: 받는 돈(막대 길이 = 복리 대비) + 넣은 돈 대비 이자
 * - 방식 이름(ⓘ)을 누르면 뜻 바텀시트 → 확인 / AI 튜터에게 물어보기
 * - 입력값 불러오기 · 자동 저장 (GET · PUT /tools/conditions, toolType COMPOUND)
 * (Figma 디자인 없음 — 대출 상환 비교 화면 스타일에 맞춤)
 */
import clsx from 'clsx'
import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { useToolConditions } from '@/hooks/useToolConditions'
import { ROUTES } from '@/router/routes'

type Method = 'compound' | 'simple'

/** 입력 범위 */
const PRINCIPAL = { min: 0, max: 100_000_000, step: 1_000_000 } // 0 ~ 1억
const DEPOSIT = { min: 0, max: 3_000_000, step: 100_000 } // 매달 0 ~ 300만
const RATE = { min: 1, max: 10, step: 0.1 } // 연 1% ~ 10% (직접 입력은 소수 둘째 자리까지)
const YEARS = { min: 1, max: 30, step: 1 } // 1 ~ 30년

/** 저장값이 범위 밖이면 슬라이더 끝으로 맞춘다 */
const clamp = (value: number, { min, max }: { min: number; max: number }) =>
  Math.min(Math.max(value, min), max)

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
      '맡긴 원금에만 이자가 붙는 방식이에요. 붙은 이자에는 다시 이자가 붙지 않아서, 오래 둬도 늘어나는 속도는 그대로예요.',
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

/**
 * month개월 뒤 받는 돈 (넣은 돈 + 이자), 월 이율 r = 연 이율 ÷ 12, 적립금은 매달 초에 넣는다
 * - 복리: 처음 넣은 돈 P(1+r)^m + 적립금 D × ((1+r)^m − 1) / r × (1+r)
 * - 단리: 처음 넣은 돈 P(1 + r·m) + 적립금 D·m + 적립 이자 D·r·m(m+1)/2 (k번째 달에 넣은 돈은 m−k+1개월치 이자)
 */
function amountAfter(
  method: Method,
  { principal, deposit, rate }: { principal: number; deposit: number; rate: number },
  month: number,
) {
  const r = rate / 100 / 12
  if (method === 'simple') {
    return principal * (1 + r * month) + deposit * month + (deposit * r * month * (month + 1)) / 2
  }
  const growth = (1 + r) ** month
  return principal * growth + (deposit * (growth - 1) * (1 + r)) / r
}

export default function CompoundInterestPage() {
  const navigate = useNavigate()
  const [principal, setPrincipal] = useState(10_000_000)
  const [deposit, setDeposit] = useState(100_000)
  const [rate, setRate] = useState(5)
  const [years, setYears] = useState(10)
  const touched = useToolConditions('COMPOUND', { principal, deposit, rate, years }, (saved) => {
    setPrincipal(clamp(saved.principal, PRINCIPAL))
    setDeposit(clamp(saved.deposit, DEPOSIT))
    setRate(clamp(saved.rate, RATE))
    setYears(clamp(saved.years, YEARS))
  })
  const [openMethod, setOpenMethod] = useState<Method | null>(null)

  const input = { principal, deposit, rate }
  const months = years * 12
  const paid = principal + deposit * months // 넣은 돈 합계
  const total: Record<Method, number> = {
    compound: amountAfter('compound', input, months),
    simple: amountAfter('simple', input, months),
  }
  /** 넣은 돈 대비 이자: '이자 629만 원 (+63%)' */
  const interestText = (method: Method) => {
    const interest = total[method] - paid
    const ratio = paid > 0 ? Math.round((interest / paid) * 100) : 0
    return `이자 ${formatWon(interest)} (넣은 돈 대비 +${ratio}%)`
  }

  /** 바텀시트 예시: 1,000만 원을 지금 이율로 2년 둘 때 해마다 붙는 이자 (처음 넣는 돈이 있으면 그 금액으로) */
  const base = principal > 0 ? principal : 10_000_000
  const baseInput = { principal: base, deposit: 0, rate }
  const year1 = amountAfter('compound', baseInput, 12) - base
  const year2 = amountAfter('compound', baseInput, 24) - amountAfter('compound', baseInput, 12)
  const exampleText: Record<Method, string> = {
    compound: `예) ${formatWon(base)}을 연 ${Number(rate.toFixed(2))}%로 두면 첫해 이자는 ${formatWon(year1)}, 둘째 해에는 이자에도 이자가 붙어 ${formatWon(year2)}으로 늘어요`,
    simple: `예) ${formatWon(base)}을 연 ${Number(rate.toFixed(2))}%로 두면 해마다 똑같이 ${formatWon((base * rate) / 100)}씩 이자가 붙어요`,
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
          unit={{ scale: 10_000, suffix: '만 원', decimals: 0 }}
          onChange={(v) => {
            touched()
            setPrincipal(v)
          }}
        />
        <Slider
          label="매달 넣는 돈"
          display={formatWon(deposit)}
          value={deposit}
          {...DEPOSIT}
          unit={{ scale: 10_000, suffix: '만 원', decimals: 0 }}
          onChange={(v) => {
            touched()
            setDeposit(v)
          }}
        />
        <Slider
          label="연 이율"
          display={`${Number(rate.toFixed(2))}%`}
          value={rate}
          {...RATE}
          unit={{ scale: 1, suffix: '%', decimals: 2 }}
          onChange={(v) => {
            touched()
            setRate(v)
          }}
        />
        <Slider
          label="기간"
          display={`${years}년`}
          value={years}
          {...YEARS}
          unit={{ scale: 1, suffix: '년', decimals: 0 }}
          onChange={(v) => {
            touched()
            setYears(v)
          }}
        />
      </section>

      {/* 결론 */}
      <section className="mt-gap rounded-card bg-herb px-[18px] py-5 text-coconut-100">
        <p className="text-[13px] text-coconut-600">{years}년 뒤 복리로 받는 돈</p>
        <p className="mt-0.5 text-[20px] leading-[1.4] font-black">{formatWon(total.compound)}</p>
        <p className="mt-0.5 text-[13px] text-coconut-600">
          넣은 돈 {formatWon(paid)} · 단리보다 {formatWon(total.compound - total.simple)} 더 받아요
        </p>
      </section>

      {/* 해마다 불어나는 돈 */}
      <section className="mt-gap rounded-card bg-coconut-100 p-[18px] shadow-[0_6px_0_var(--color-coconut-600)]">
        <h2 className="text-[15px] leading-[1.4] font-black text-herb">
          해마다 불어나는 돈{' '}
          <span className="text-sub font-bold text-herb-400">· 오래 둘수록 차이가 커져요</span>
        </h2>
        <GrowthChart input={input} years={years} />
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
          <span className="text-sub font-bold text-herb-400">· 월 복리 · 세전 기준</span>
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
                    style={{
                      width: `${total.compound > 0 ? (total[method] / total.compound) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-sub font-normal text-herb-400">{interestText(method)}</p>
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
 * - 세로축은 0원이 아니라 처음 넣은 돈부터 시작해, 늘어난 부분이 잘 보이게 한다
 */
function GrowthChart({
  input,
  years,
}: {
  input: { principal: number; deposit: number; rate: number }
  years: number
}) {
  const W = 300
  const H = 140
  const PAD = { top: 10, bottom: 22, left: 4, right: 4 }
  const bottom = input.principal
  const top = amountAfter('compound', input, years * 12)
  // 넣은 돈이 없으면 선이 평평하다 (0으로 나누지 않게 높이는 최소 1)
  const range = Math.max(top - bottom, 1)

  const x = (year: number) => PAD.left + (year / years) * (W - PAD.left - PAD.right)
  const y = (won: number) => PAD.top + (1 - (won - bottom) / range) * (H - PAD.top - PAD.bottom)

  const points = (method: Method) =>
    Array.from(
      { length: years + 1 },
      (_, year) => `${x(year)},${y(amountAfter(method, input, year * 12))}`,
    ).join(' ')

  const ticks = years === 1 ? [0, 1] : [0, Math.round(years / 2), years]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${years}년 동안 복리는 ${formatWon(top)}, 단리는 ${formatWon(amountAfter('simple', input, years * 12))}까지 늘어나요`}
      className="mt-3 w-full"
    >
      {/* 바닥선 (처음 넣은 돈) */}
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

/**
 * 이름 · 값 한 줄 + 아래 슬라이더 (채운 부분은 apricot-700, 나머지는 coconut-200)
 * - 값(✎ 아이콘)을 누르면 숫자 입력칸으로 바뀌어 직접 입력할 수 있다 (Enter 또는 칸 밖을 누르면 적용, Esc는 취소)
 * - 입력은 unit 단위로 받는다 (예: 금액은 만 원 단위), 범위를 넘으면 최소 · 최대로 맞춘다
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
              onChange={(e) => setDraft(e.target.value.replace(/[^\d.,]/g, ''))}
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
