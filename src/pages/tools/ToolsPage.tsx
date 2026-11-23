/**
 * 금융 도구: 도구 카드 3개(대출 상환 방식 비교 · 복리 계산기 · 금리 변동 시뮬레이터) + 아래 안내 문구
 * - 카드를 누르면 각 도구 화면으로 이동
 * - 오른쪽 ▶ 버튼은 홈 '학습 시작' 버튼과 같은 모양 (누를 수 있다는 표시, 실제로 누르는 곳은 카드 전체)
 * - 준비 중인 도구는 흐리게 하고 누를 수 없게
 * Figma 975 → 390 (÷2.5)
 */
import clsx from 'clsx'
import { useNavigate } from 'react-router'

import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

type Tool = {
  to: string
  title: string
  description: string
  emoji: string
  /** 카드 바탕 */
  card: string
  /** 아이콘 칸 바탕 · 아래 그림자 */
  icon: string
  titleColor: string
  descriptionColor: string
  /** 아직 화면이 없는 도구 */
  comingSoon?: boolean
}

const TOOLS: Tool[] = [
  {
    to: ROUTES.loanRepayment,
    title: '대출 상환 방식 비교',
    description: '원리금균등 · 원금균등 · 만기일시',
    emoji: '🏦',
    card: 'bg-apricot-300',
    icon: 'bg-avocado-300 shadow-[0_3px_0_var(--color-avocado-400)]',
    titleColor: 'text-herb',
    descriptionColor: 'text-avocado-500',
  },
  {
    to: ROUTES.compoundInterest,
    title: '복리 계산기',
    description: '시간이 지날수록 커지는 차이',
    emoji: '🌱',
    card: 'bg-avocado-400',
    icon: 'bg-herb shadow-[0_3px_0_var(--color-herb-900)]',
    titleColor: 'text-coconut-100',
    descriptionColor: 'text-coconut-600',
  },
  {
    to: ROUTES.rateSimulator,
    title: '금리 변동 시뮬레이터',
    description: '금리가 오르면 이자는 얼마나?',
    emoji: '📊',
    card: 'bg-herb-100',
    icon: 'bg-apricot-700 shadow-[0_3px_0_var(--color-burnt-orange-800)]',
    titleColor: 'text-herb',
    descriptionColor: 'text-avocado-500',
  },
]

export default function ToolsPage() {
  const navigate = useNavigate()

  return (
    // AppLayout의 main은 높이가 없어서, 화면 높이(위 여백 · 하단 바 자리 제외)를 직접 채워
    // 안내 문구를 mt-auto로 하단 바 바로 위에 붙인다
    <div className="flex min-h-[calc(100dvh-var(--spacing-gutter)-var(--spacing-nav)-var(--spacing-nav-inset)*2-env(safe-area-inset-bottom))] flex-col">
      <header className="flex items-center">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.home)}
          className="flex h-10 w-8 items-center text-herb"
        >
          <BackIcon className="w-[19px]" />
        </button>
        <h1 className="text-[18px] font-bold text-herb">금융 도구</h1>
      </header>

      <p className="mt-[18px] text-[16px] leading-[1.4] font-medium text-avocado-500">
        배운 개념을 숫자로 확인해 봐요
      </p>

      <ul className="mt-3 flex flex-col gap-gap">
        {TOOLS.map(
          ({
            to,
            title,
            description,
            emoji,
            card,
            icon,
            titleColor,
            descriptionColor,
            comingSoon,
          }) => (
            <li key={to}>
              <button
                type="button"
                disabled={comingSoon}
                onClick={() => navigate(to)}
                className={clsx(
                  // group: 카드를 누르면 오른쪽 ▶ 버튼이 눌린 것처럼 내려간다
                  'group flex h-[87px] w-full items-center gap-gap rounded-card px-[18px] text-left',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  card,
                )}
              >
                <span
                  aria-hidden
                  className={clsx(
                    'flex h-[51px] w-[42px] shrink-0 items-center justify-center rounded-[14px] text-[22px]',
                    icon,
                  )}
                >
                  {emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={clsx('block text-[18px] leading-[1.4] font-bold', titleColor)}>
                    {title}
                  </span>
                  <span className={clsx('block text-[13px] leading-[1.4]', descriptionColor)}>
                    {description}
                  </span>
                </span>
                {/* 홈 '학습 시작' 버튼과 같은 색 · 그림자 · 눌림 (글자 대신 ▶만, 제목이 꺾이지 않게) */}
                {!comingSoon && (
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-coconut-100 text-[14px] text-herb shadow-[0_4px_0_var(--color-coconut-600)] transition-[transform,box-shadow] duration-75 group-active:translate-y-1 group-active:shadow-none"
                  >
                    ▶
                  </span>
                )}
              </button>
            </li>
          ),
        )}
      </ul>

      <p className="mt-auto flex items-center justify-center gap-1 pt-6 pb-[14px] text-[13px] font-medium text-coconut-700">
        <InfoIcon className="size-[12px]" />
        실제 금융기관 조건과 다를 수 있어요
      </p>
    </div>
  )
}

/** ⓘ 아이콘 (안내 문구 앞) */
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden className={className}>
      <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
      <circle cx="6" cy="3.6" r="0.75" fill="currentColor" />
      <path d="M6 5.4v3.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}
