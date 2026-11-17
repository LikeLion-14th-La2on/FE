/**
 * 학습: 섹터 탭 3개 + 오늘의 섹터 표시 + 단계 길(완료 ✓ · 지금 ★ · 잠김 🔒 · 끝에 선물 🎁)
 * - 월~토: 오늘의 섹터 탭만 열려 있고, 다른 섹터 탭은 잠겨서 고를 수 없다
 * - 일요일(복습하는 날): 오늘의 섹터가 없어서 탭을 골라 아무 섹터나 학습한다
 *   (홈 '자유 학습'에서 넘겨받은 섹터가 있으면 그 탭이 먼저 열린다)
 * Figma 975 → 390 (÷2.5)
 */
import clsx from 'clsx'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import BackIcon from '@/components/icons/BackIcon'
import { getSectorOfDay, SECTORS, type Sector } from '@/constants/sectors'
import { ROUTES } from '@/router/routes'

// TODO: 학습 진행 API 연결 후 교체 (섹터별로 깬 단계 수 / 전체 단계 수)
const MOCK_PROGRESS: Record<Sector, { cleared: number; total: number }> = {
  stock: { cleared: 1, total: 3 },
  life: { cleared: 0, total: 3 },
  basic: { cleared: 2, total: 3 },
}

const SECTOR_ORDER: Sector[] = ['stock', 'life', 'basic']

/** 섹터별 색: 바탕(500) + 입체 그림자(600) */
const SECTOR_COLOR: Record<Sector, { bg: string; shadow: string }> = {
  stock: { bg: 'bg-apricot-500', shadow: 'shadow-[0_4px_0_var(--color-apricot-600)]' },
  life: { bg: 'bg-avocado-500', shadow: 'shadow-[0_4px_0_var(--color-avocado-600)]' },
  basic: {
    bg: 'bg-burnt-orange-500',
    shadow: 'shadow-[0_4px_0_var(--color-burnt-orange-600)]',
  },
}
const NODE_SHADOW: Record<Sector, string> = {
  stock: 'shadow-[0_6px_0_var(--color-apricot-600)]',
  life: 'shadow-[0_6px_0_var(--color-avocado-600)]',
  basic: 'shadow-[0_6px_0_var(--color-burnt-orange-600)]',
}
const START_TEXT: Record<Sector, string> = {
  stock: 'text-apricot-500',
  life: 'text-avocado-500',
  basic: 'text-burnt-orange-500',
}

/** 단계 길이 지그재그로 내려가도록, 가운데 기준 가로 위치(px)를 4칸마다 반복 (Figma 그대로) */
const ZIGZAG = [17.5, -87.5, 0, 70]

type NodeKind = 'done' | 'current' | 'locked' | 'gift'

export default function SectorStagePage() {
  const navigate = useNavigate()
  const todaySector = getSectorOfDay()
  const fromHome = (useLocation().state as { sector?: Sector } | null)?.sector
  // 일요일에만 섹터를 직접 고를 수 있다
  const canChooseSector = todaySector === null
  const [chosenSector, setChosenSector] = useState<Sector>(fromHome ?? 'stock')
  // 평일엔 넘겨받은 값과 상관없이 항상 오늘의 섹터
  const sector = todaySector ?? chosenSector

  const { cleared, total } = MOCK_PROGRESS[sector]
  const nextStage = cleared + 1
  // 단계 1~total + 마지막에 선물
  const nodes: { kind: NodeKind; stage: number }[] = [
    ...Array.from({ length: total }, (_, i) => {
      const stage = i + 1
      const kind: NodeKind = stage <= cleared ? 'done' : stage === nextStage ? 'current' : 'locked'
      return { kind, stage }
    }),
    { kind: 'gift', stage: total + 1 },
  ]

  const startStage = (stage: number) => navigate(ROUTES.termPreview(sector, stage))

  return (
    <>
      <header className="flex items-center">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.home)}
          className="flex h-10 w-8 items-center text-herb"
        >
          <BackIcon className="w-[19px]" />
        </button>
        <h1 className="text-[18px] font-bold text-herb">학습</h1>
      </header>

      {/* 섹터 탭 (선택 안 된 탭만 입체 그림자) */}
      <div role="tablist" aria-label="섹터" className="mt-[18px] grid grid-cols-3 gap-2">
        {SECTOR_ORDER.map((key) => {
          const { label, emoji } = SECTORS[key]
          const selected = key === sector
          const locked = !canChooseSector && !selected
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-disabled={locked}
              disabled={locked}
              onClick={() => setChosenSector(key)}
              className={clsx(
                'flex h-[81px] flex-col items-center rounded-[18px] pt-[18px] text-coconut-100',
                SECTOR_COLOR[key].bg,
                // 선택 안 된 탭에만 입체 그림자 (선택된 탭은 눌린 것처럼 그림자 없음)
                !selected && SECTOR_COLOR[key].shadow,
                // 잠긴 탭: 흐리게 + 누를 수 없음
                locked && 'cursor-not-allowed opacity-40',
              )}
            >
              <span aria-hidden className="text-[22px] leading-none">
                {emoji}
              </span>
              <span className="mt-[9px] text-[14px] font-bold">{label}</span>
            </button>
          )
        })}
      </div>

      {/* 오늘의 섹터 (일요일은 복습하는 날) */}
      <p
        className={clsx(
          'mt-[19px] self-start rounded-full px-3 py-[5px] text-[13px] font-bold text-coconut-100',
          todaySector ? SECTOR_COLOR[todaySector].bg : 'bg-herb-400',
        )}
      >
        {todaySector ? `오늘의 섹터 · ${SECTORS[todaySector].label}` : '오늘은 복습하는 날'}
      </p>

      {/* 단계 길 */}
      <ol className="-mt-[5px] flex flex-col">
        {nodes.map(({ kind, stage }, i) => (
          <li
            key={stage}
            className="flex h-[105px] items-center justify-center"
            style={{ transform: `translateX(${ZIGZAG[i % ZIGZAG.length]}px)` }}
          >
            <StageNode
              kind={kind}
              stage={stage}
              sector={sector}
              onStart={() => startStage(stage)}
            />
          </li>
        ))}
      </ol>
    </>
  )
}

function StageNode({
  kind,
  stage,
  sector,
  onStart,
}: {
  kind: NodeKind
  stage: number
  sector: Sector
  onStart: () => void
}) {
  // Figma 모서리 84 (노드 높이의 절반 정도라 둥근 사각형처럼 보임)
  const nodeBase = 'flex items-center justify-center rounded-[33px]'

  if (kind === 'current') {
    return (
      // 큰 노드(88×77)를 가운데에 두고, '시작!' 말풍선은 오른쪽 11px 옆에 붙인다
      <div className="relative">
        <button
          type="button"
          aria-label={`${stage}단계 시작`}
          onClick={onStart}
          className={clsx(
            nodeBase,
            'h-[77px] w-[88px] rounded-[39px] text-coconut-100 transition-[transform,box-shadow] duration-75 active:translate-y-1.5 active:shadow-none',
            SECTOR_COLOR[sector].bg,
            NODE_SHADOW[sector],
          )}
        >
          <StarIcon className="w-6" />
        </button>
        <button
          type="button"
          onClick={onStart}
          className={clsx(
            'absolute top-1/2 left-[calc(100%+11px)] h-[34px] w-[58px] -translate-y-1/2 rounded-[11px] border-2 border-coconut-600 bg-coconut-100 text-[15px] font-bold',
            START_TEXT[sector],
          )}
        >
          시작!
        </button>
      </div>
    )
  }

  if (kind === 'done') {
    return (
      <div
        role="img"
        aria-label={`${stage}단계 완료`}
        className={clsx(
          nodeBase,
          'h-[67px] w-[76px] text-coconut-100',
          SECTOR_COLOR[sector].bg,
          NODE_SHADOW[sector],
        )}
      >
        <CheckIcon className="w-[19px]" />
      </div>
    )
  }

  // 잠긴 단계 · 마지막 선물: 회색 + 이모지
  return (
    <div
      role="img"
      aria-label={kind === 'gift' ? '섹터 완주 선물' : `${stage}단계 잠김`}
      className={clsx(
        nodeBase,
        'h-[67px] w-[76px] bg-coconut-600 text-[26px] leading-none shadow-[0_6px_0_var(--color-coconut-700)]',
      )}
    >
      <span aria-hidden>{kind === 'gift' ? '🎁' : '🔒'}</span>
    </div>
  )
}

/** Figma 체크 표시 (흰색, currentColor) */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="568 646 47 53" className={className} fill="currentColor" aria-hidden>
      <path d="M579.645 698.595C578.648 695.822 577.565 693.222 576.395 690.795C575.268 688.325 574.033 685.942 572.69 683.645C571.347 681.348 569.83 679.008 568.14 676.625L574.25 672.595C576.287 675.585 578.063 678.683 579.58 681.89C581.097 685.053 582.462 688.195 583.675 691.315H583.935C585.235 686.895 586.773 682.583 588.55 678.38C590.37 674.133 592.342 670.082 594.465 666.225C596.632 662.325 598.928 658.707 601.355 655.37C603.825 652.033 606.36 649.065 608.96 646.465L614.875 651.665C611.408 654.915 608.05 658.772 604.8 663.235C601.55 667.698 598.538 672.79 595.765 678.51C593.035 684.187 590.695 690.513 588.745 697.49L579.645 698.595Z" />
    </svg>
  )
}

/** Figma 별 (흰색, currentColor) */
function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="298 919 61 58" className={className} fill="currentColor" aria-hidden>
      <path d="M358.78 941.21V941.6L340.45 954.925L347.665 976.83L347.405 976.96L328.75 963.44L310.095 976.96L309.835 976.83L317.05 954.925L298.72 941.6V941.21H321.405L328.555 919.435H328.945L336.095 941.21H358.78Z" />
    </svg>
  )
}
