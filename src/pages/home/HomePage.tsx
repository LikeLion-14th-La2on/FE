/**
 * 홈: 인사 + 연속 학습·도토리·보호권 칩 / 오늘의 나무(도토리 n/7) / 오늘의 섹터 / 이번 주 연속 학습 / 오답 복습
 * Figma 975 → 390 (÷2.5)
 */
import clsx from 'clsx'
import { type ReactNode, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'

import acorn0 from '@/assets/acorn/acorn-0.svg'
import acorn15 from '@/assets/acorn/acorn-15.svg'
import acorn45 from '@/assets/acorn/acorn-45.svg'
import acornM15 from '@/assets/acorn/acorn-m15.svg'
import acornM30 from '@/assets/acorn/acorn-m30.svg'
import treeAutumn from '@/assets/tree/tree-autumn.svg'
import treeSpring from '@/assets/tree/tree-spring.svg'
import treeSummer from '@/assets/tree/tree-summer.svg'
import treeWinter from '@/assets/tree/tree-winter.svg'
import { Card } from '@/components/common'
import { getSectorOfDay, SECTORS, type Sector } from '@/constants/sectors'
import { ROUTES } from '@/router/routes'

/**
 * TODO: 홈 API(GET /api/v1/home) 연결 후 실제 값으로 교체
 * 연속 학습 끊김은 서버가 홈 조회 때 판정해서, 처리 후 값만 내려준다 (FE는 계산하지 않는다)
 * - 빠진 날 수만큼 보호권이 있으면 자동으로 쓰고 연속 유지, 모자라면 쓰지 않고 연속 0 · 도토리 1개 떨어짐
 */
const MOCK = {
  nickname: 'OO',
  streak: {
    currentCount: 5, // 처리 후 연속 학습일 (끊겼으면 0)
    shieldCount: 1, // 처리 후 남은 보호권 수
  },
  acornBalance: 30, // 처리 후 도토리 잔액
  tree: {
    acornCount: 4, // 처리 후 나무에 붙어 있는 도토리 (7개가 되면 숲으로)
    fallenCount: 1, // 지금 나무에서 떨어진 도토리 누적 수 (바닥에 놓인다)
    acornFell: true, // 이번 홈 조회에서 실제로 떨어졌으면 true (같은 끊김으로는 한 번만)
  },
  forestCount: 2,
  // 일요일(복습하는 날)에는 둘 다 null
  todaySector: getSectorOfDay(),
  nextStage: getSectorOfDay() ? 2 : null,
  week: [true, true, true, true, true, false, false], // 월~일 학습 여부
  wrongYesterday: 2,
}

const ACORNS_PER_TREE = 7

/**
 * 도토리 배치 4가지 (나무 이미지 기준 %, 위에서부터 채워지는 순서)
 * - 잎 안쪽에만 있고, 서로 겹치지 않고, 좌우 균형이 맞는 배치만 골랐다. 3·4번은 1·2번을 좌우로 뒤집은 것
 * - 채우는 순서는 이미 붙은 도토리에서 가장 먼 자리부터라, 몇 개만 있어도 한쪽에 몰리지 않는다
 * - % 단위라 나무 크기가 바뀌어도 같은 자리에 붙고, 계절 나무 4종 모두 잎 모양이 같다
 */
const ACORN_LAYOUTS = [
  [
    { left: 40.0, top: 22.7 },
    { left: 54.3, top: 47.2 },
    { left: 31.4, top: 43.8 },
    { left: 66.3, top: 31.8 },
    { left: 53.1, top: 8.5 },
    { left: 26.3, top: 9.1 },
    { left: 19.4, top: 29.0 },
  ],
  [
    { left: 39.4, top: 31.8 },
    { left: 58.3, top: 11.9 },
    { left: 22.3, top: 12.5 },
    { left: 63.4, top: 36.9 },
    { left: 21.1, top: 40.3 },
    { left: 44.6, top: 51.1 },
    { left: 40.0, top: 5.1 },
  ],
  [
    { left: 42.3, top: 22.7 },
    { left: 28.0, top: 47.2 },
    { left: 50.9, top: 43.8 },
    { left: 16.0, top: 31.8 },
    { left: 29.2, top: 8.5 },
    { left: 56.0, top: 9.1 },
    { left: 62.9, top: 29.0 },
  ],
  [
    { left: 42.9, top: 31.8 },
    { left: 24.0, top: 11.9 },
    { left: 60.0, top: 12.5 },
    { left: 18.9, top: 36.9 },
    { left: 61.2, top: 40.3 },
    { left: 37.7, top: 51.1 },
    { left: 42.3, top: 5.1 },
  ],
]

const ACORN_SIZE = 17.7 // 나무 폭 대비 % (124 / 700)

/** 같은 seed면 항상 같은 값이 나오는 난수 (mulberry32) */
function seededRandom(seed: string) {
  let h = 0
  for (const ch of seed) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0
  return () => {
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 나무 가운데에서 바깥쪽으로 갈수록 바깥으로 기울어진 도토리를 쓴다 (매달린 느낌) */
function getAcornImage(left: number) {
  const center = left + ACORN_SIZE / 2
  if (center < 30) return acornM30
  if (center < 43) return acornM15
  if (center < 57) return acorn0
  if (center < 70) return acorn15
  return acorn45
}

/**
 * 나무마다 배치 4가지 중 하나를 고른다 (몇 번째 나무인지를 seed로 써서, 나무가 바뀌면 배치도 바뀐다)
 * 한 나무를 키우는 동안은 배치가 그대로라, 도토리가 늘거나 떨어져도 나머지 도토리는 제자리에 있다.
 */
function getTreeAcornLayout(treeNumber: number) {
  const random = seededRandom(`tree-${treeNumber}`)
  const layout = ACORN_LAYOUTS[Math.floor(random() * ACORN_LAYOUTS.length)]
  return layout.map((spot) => ({ ...spot, src: getAcornImage(spot.left) }))
}

/**
 * 떨어진 도토리가 놓이는 바닥 자리 7곳 (나무 이미지 기준 %, rotate는 누운 각도)
 * 나무 그림자 위, 줄기 좌우·앞쪽에 흩어 놓았다
 */
const GROUND_SPOTS = [
  { left: 22, top: 80, rotate: -80 },
  { left: 60, top: 79.5, rotate: 75 },
  { left: 41, top: 82.5, rotate: -30 },
  { left: 10, top: 77.5, rotate: 100 },
  { left: 51, top: 83.5, rotate: 60 },
  { left: 31, top: 83, rotate: -95 },
  { left: 68, top: 77, rotate: 20 },
]
/** 계절별 나무: 봄(3~5) 분홍 · 여름(6~8) 초록 · 가을(9~11) 주황 · 겨울(12~2) 흰색 */
function getSeasonTree(month = new Date().getMonth() + 1) {
  if (month >= 3 && month <= 5) return treeSpring
  if (month >= 6 && month <= 8) return treeSummer
  if (month >= 9 && month <= 11) return treeAutumn
  return treeWinter
}

const SECTOR_CARD_BG: Record<Sector, string> = {
  stock: 'bg-apricot-500',
  life: 'bg-avocado-500',
  basic: 'bg-burnt-orange-500',
}

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일']

export default function HomePage() {
  const navigate = useNavigate()
  // 나무 하나에 최대 7개: 서버 값이 7을 넘거나 음수여도 0~7 사이로 맞춘다
  const acornCount = Math.min(Math.max(MOCK.tree.acornCount, 0), ACORNS_PER_TREE)
  // 바닥 자리도 7곳이라 그 이상은 그리지 않는다
  const fallenCount = Math.min(Math.max(MOCK.tree.fallenCount, 0), GROUND_SPOTS.length)
  const acornLayout = useMemo(() => getTreeAcornLayout(MOCK.forestCount + 1), [])
  // 이번에 떨어진 도토리는 남은 도토리 바로 다음 자리(가장 최근에 붙었던 자리)에서 떨어진다
  const fellFrom =
    MOCK.tree.acornFell && fallenCount > 0 && acornCount < ACORNS_PER_TREE
      ? acornLayout[acornCount]
      : null

  return (
    <div className="flex flex-col gap-gap">
      {/* 인사 + 칩 */}
      <header className="flex items-center justify-between">
        <h1 className="min-w-0 truncate text-title text-avocado-500">
          {MOCK.nickname}님, 반가워요
        </h1>
        <div className="flex shrink-0 gap-[6px]">
          <Chip className="bg-apricot-200 text-apricot-700" icon="🔥" label="연속 학습">
            {MOCK.streak.currentCount}
          </Chip>
          <Chip className="bg-avocado-200 text-avocado-500" icon="🌰" label="도토리">
            {MOCK.acornBalance}
          </Chip>
          <Chip className="bg-herb-100 text-herb-400" icon="🛡️" label="보호권">
            {MOCK.streak.shieldCount}
          </Chip>
        </div>
      </header>

      {/* 오늘의 나무 */}
      <Card className="relative rounded-[24px] p-0 pt-5 pb-5">
        <p className="absolute top-[19px] right-[19px] flex items-center gap-1 text-[15px] font-medium text-apricot-700">
          <span aria-hidden>🌰</span>
          <span>
            {acornCount} / {ACORNS_PER_TREE}
          </span>
        </p>

        <div className="relative mx-auto w-[280px]">
          <img src={getSeasonTree()} alt="" className="w-full" />
          {acornLayout.slice(0, acornCount).map(({ src, left, top }, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="absolute"
              style={{ left: `${left}%`, top: `${top}%`, width: `${ACORN_SIZE}%` }}
            />
          ))}
          <FallenAcorns count={fallenCount} fellFrom={fellFrom} />
        </div>

        {/* 다람쥐 캐릭터 자리 (이미지 준비되면 넣기, Figma 지름 72 · 중심 294,276) */}
        <div className="absolute top-[240px] left-[258px] size-[72px]" aria-hidden />

        {/* TODO: 내 숲 화면 생기면 연결 */}
        <button
          type="button"
          className="mx-auto mt-8 flex items-center gap-1 text-sub font-bold text-avocado-500"
        >
          <span aria-hidden>🌳</span>내 숲 {MOCK.forestCount}그루 ›
        </button>
      </Card>

      {/* 오늘의 섹터 (일요일은 복습하는 날) */}
      {MOCK.todaySector && MOCK.nextStage ? (
        <TodaySectorCard sector={MOCK.todaySector} stage={MOCK.nextStage} />
      ) : (
        <ReviewDayCard />
      )}

      {/* 이번 주 연속 학습 */}
      <Card className="px-[18px] pt-5 pb-[18px] shadow-[0_4px_12px_rgb(0_0_0/0.05)]">
        <h2 className="flex items-center gap-1 text-[16px] font-bold text-herb">
          <span aria-hidden>🔥</span>
          {MOCK.streak.currentCount}일 연속 학습 중
        </h2>
        <ul className="mt-[14px] flex justify-between">
          {WEEK_DAYS.map((day, i) => (
            <li key={day} className="flex flex-col items-center gap-1">
              <span
                className={clsx(
                  'flex size-[30px] items-center justify-center rounded-full text-[12px]',
                  MOCK.week[i] ? 'bg-apricot-600' : 'bg-coconut-600',
                )}
              >
                {MOCK.week[i] && <span aria-label="학습함">🌰</span>}
              </span>
              <span className="text-tag font-medium text-herb-400">{day}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 어제 틀린 문제 복습 */}
      {MOCK.wrongYesterday > 0 && (
        <button
          type="button"
          onClick={() => navigate(ROUTES.wrongNote)}
          className="flex h-12 items-center gap-1 rounded-[18px] bg-burnt-orange-500 px-[18px] text-card-title text-coconut-100 shadow-[0_6px_0_var(--color-burnt-orange-700)] transition-[transform,box-shadow] duration-75 active:translate-y-1.5 active:shadow-none"
        >
          <span aria-hidden>✏️</span>
          어제 틀린 문제 {MOCK.wrongYesterday}개, 오늘은 맞혀볼까요? ›
        </button>
      )}
    </div>
  )
}

/** 상단 알약형 칩 (Figma 높이 72 → 28.8) */
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

/**
 * 연속 학습이 끊겨 떨어진 도토리: 끊김 1번에 1개씩 나무에서 떨어져 바닥에 쌓인다 (tree.fallenCount)
 * - 이번 홈 조회에서 떨어졌으면(tree.acornFell) 마지막 1개만 나무 자리(fellFrom)에서 떨어지는 애니메이션
 *   서버가 같은 끊김으로는 한 번만 true를 주니, 홈을 다시 열어도 또 떨어지지 않는다
 * - 나머지는 처음부터 바닥에 누워 있다
 * - 움직임 줄이기 설정이면 애니메이션 없이 바로 바닥에 놓인다
 */
function FallenAcorns({
  count,
  fellFrom,
}: {
  count: number
  fellFrom: { left: number; top: number } | null
}) {
  const fallen = GROUND_SPOTS.slice(0, count)
  const lastRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!fellFrom || count === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ground = GROUND_SPOTS[count - 1]
    // translate %는 도토리 자기 크기 기준이라, 나무 기준 % 차이를 도토리 크기로 나눠 바꾼다
    const dx = ((fellFrom.left - ground.left) / ACORN_SIZE) * 100
    const dy = ((fellFrom.top - ground.top) / ACORN_SIZE) * 100
    const landed = `translate(0, 0) rotate(${ground.rotate}deg)`
    lastRef.current?.animate(
      [
        // 중력처럼 점점 빨라지며 떨어지고 → 땅에 닿아 살짝 튀었다가 → 다시 내려앉는다
        {
          transform: `translate(${dx}%, ${dy}%) rotate(0deg)`,
          easing: 'cubic-bezier(0.55, 0, 1, 0.45)',
        },
        { transform: landed, offset: 0.72, easing: 'ease-out' },
        {
          transform: `translate(0, -14%) rotate(${ground.rotate}deg)`,
          offset: 0.86,
          easing: 'ease-in',
        },
        { transform: landed },
      ],
      { duration: 900, delay: 400, fill: 'backwards' },
    )
    // 처음 그릴 때 한 번만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (count === 0) return null

  return (
    <>
      {fellFrom && <p className="sr-only">학습을 쉬어서 나무에서 도토리 1개가 떨어졌어요</p>}
      {fallen.map(({ left, top, rotate }, i) => (
        <img
          key={i}
          ref={i === count - 1 ? lastRef : undefined}
          src={acorn0}
          alt=""
          className="absolute"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${ACORN_SIZE}%`,
            transform: `rotate(${rotate}deg)`,
          }}
        />
      ))}
    </>
  )
}

const START_BUTTON_CLASS =
  'h-10 w-[100px] rounded-[14px] bg-coconut-100 text-[14px] font-bold text-herb shadow-[0_4px_0_var(--color-coconut-600)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-none'

/** 오늘의 섹터: 요일별 섹터의 다음 단계로 바로 학습 시작 */
function TodaySectorCard({ sector, stage }: { sector: Sector; stage: number }) {
  const navigate = useNavigate()
  const { label, emoji } = SECTORS[sector]

  return (
    <section
      className={clsx(
        'flex h-[74px] items-center justify-between rounded-[24px] px-[18px]',
        SECTOR_CARD_BG[sector],
      )}
    >
      <div>
        <p className="text-tag font-medium text-avocado-200">오늘의 섹터</p>
        <p className="flex items-center gap-1 text-[18px] font-bold text-coconut-100">
          <span aria-hidden>{emoji}</span>
          {label} {stage}단계
        </p>
      </div>
      <button
        type="button"
        // 학습 화면으로 가서 오늘의 섹터 탭을 연다 (단계 길에서 '시작!'을 누르면 용어 미리보기로)
        onClick={() => navigate(ROUTES.learn, { state: { sector } })}
        className={START_BUTTON_CLASS}
      >
        학습 시작 ▶
      </button>
    </section>
  )
}

/**
 * 일요일: 오늘의 섹터 없이 아무 섹터나 골라서 학습 (하루 학습으로 인정)
 * TODO: 일요일 디자인 나오면 맞추기 (지금은 오늘의 섹터 카드 모양만 빌려 씀)
 */
function ReviewDayCard() {
  const navigate = useNavigate()

  return (
    <section className="flex h-[74px] items-center justify-between rounded-[24px] bg-herb-400 px-[18px]">
      <div>
        <p className="text-tag font-medium text-herb-100">일요일은 복습하는 날</p>
        <p className="flex items-center gap-1 text-[18px] font-bold text-coconut-100">
          <span aria-hidden>📚</span>
          자유 학습
        </p>
      </div>
      <button type="button" onClick={() => navigate(ROUTES.learn)} className={START_BUTTON_CLASS}>
        섹터 고르기 ▶
      </button>
    </section>
  )
}
