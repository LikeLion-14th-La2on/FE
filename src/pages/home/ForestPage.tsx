/**
 * 내 숲: 완성한 나무(도토리 7개) 도감 (GET /api/v1/forest)
 * - 위: 숲 풍경(최근 나무 몇 그루) + 지금 키우는 나무 진행도
 * - 아래: 완성한 나무 3열 도감 (최신순), 누르면 완성 날짜 · 떨어진 도토리 수 바텀시트
 * - 나무 그림은 FE가 정한다: 완성한 달의 계절 나무
 * (Figma 디자인 없음 — 홈 · 마이페이지 카드 스타일에 맞춤)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'

import treeAutumn from '@/assets/tree/tree-autumn.svg'
import treeSpring from '@/assets/tree/tree-spring.svg'
import treeSummer from '@/assets/tree/tree-summer.svg'
import treeWinter from '@/assets/tree/tree-winter.svg'
import { BottomSheet, ProgressBar } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

type Tree = {
  treeId: number
  /** 완성한 날짜 (한국 날짜, yyyy-MM-dd) */
  completedAt: string
  /** 이 나무를 키우는 동안 끊김으로 떨어진 도토리 수 */
  fallenCount: number
}

// TODO: 내 숲 API(GET /api/v1/forest) 연결 후 응답 data로 교체 (trees는 완성 최신순)
const MOCK: { treeCount: number; trees: Tree[] } = {
  treeCount: 3,
  trees: [
    { treeId: 3, completedAt: '2026-11-08', fallenCount: 0 },
    { treeId: 2, completedAt: '2026-08-21', fallenCount: 2 },
    { treeId: 1, completedAt: '2026-05-02', fallenCount: 1 },
  ],
}
// TODO: 홈 응답의 tree.acornCount (지금 키우는 나무에 붙어 있는 도토리)
const GROWING_ACORNS = 4

const ACORNS_PER_TREE = 7
/** 숲 풍경에 보여줄 최근 나무 수 */
const SCENE_MAX = 5

/** 'yyyy-MM-dd' → { year, month, day } (Date로 바꾸면 시간대 때문에 하루가 밀릴 수 있어 직접 나눈다) */
function parseDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month, day }
}

/** 계절별 나무: 봄(3~5) 분홍 · 여름(6~8) 초록 · 가을(9~11) 주황 · 겨울(12~2) 흰색 (홈과 같은 규칙) */
function getSeasonTree(month: number) {
  if (month >= 3 && month <= 5) return treeSpring
  if (month >= 6 && month <= 8) return treeSummer
  if (month >= 9 && month <= 11) return treeAutumn
  return treeWinter
}

export default function ForestPage() {
  const navigate = useNavigate()
  const { treeCount, trees } = MOCK
  const [openId, setOpenId] = useState<number | null>(null)

  // 최신순이라 맨 앞이 가장 최근: n번째 나무 = 전체 수 - 순서
  const numbered = trees.map((tree, i) => ({ ...tree, number: treeCount - i }))
  const opened = numbered.find(({ treeId }) => treeId === openId)
  const acornsLeft = ACORNS_PER_TREE - GROWING_ACORNS
  // 풍경은 오래된 나무가 왼쪽에 오도록 뒤집는다
  const sceneTrees = numbered.slice(0, SCENE_MAX).reverse()

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
        <h1 className="text-[18px] font-bold text-herb">내 숲</h1>
      </header>

      {/* 숲 풍경 */}
      <section className="mt-[14px] overflow-hidden rounded-card bg-avocado-100 px-[18px] pt-5">
        <p className="text-[15px] font-bold text-avocado-500">
          <span aria-hidden>🌳</span> 내 숲 <span className="text-herb">{treeCount}그루</span>
        </p>
        <div className="relative mt-2 flex h-[104px] items-end justify-center">
          {/* 땅 */}
          <span
            aria-hidden
            className="absolute inset-x-[-18px] bottom-0 h-6 rounded-t-[50%] bg-avocado-200"
          />
          {sceneTrees.length > 0 ? (
            sceneTrees.map(({ treeId, completedAt }) => (
              <img
                key={treeId}
                src={getSeasonTree(parseDate(completedAt).month)}
                alt=""
                // 조금씩 겹쳐 심어 숲처럼 보이게
                className="relative -mx-1.5 mb-1 w-[78px]"
              />
            ))
          ) : (
            <span aria-hidden className="relative mb-4 text-[40px]">
              🌱
            </span>
          )}
        </div>
      </section>

      {/* 지금 키우는 나무 */}
      <section className="mt-gap rounded-card bg-apricot-200 px-[18px] py-4">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-apricot-800">키우는 중</p>
          <p className="text-[15px] font-bold text-apricot-700">
            <span aria-hidden>🌰</span> {GROWING_ACORNS} / {ACORNS_PER_TREE}
          </p>
        </div>
        <ProgressBar
          value={GROWING_ACORNS}
          max={ACORNS_PER_TREE}
          className="mt-2"
          trackClass="bg-coconut-100"
          fillClass="bg-apricot-600"
        />
        <p className="mt-2 text-sub text-apricot-700">
          {treeCount === 0 ? '첫 나무까지' : '다음 나무까지'} 도토리 {acornsLeft}개 남았어요
        </p>
      </section>

      {/* 도감 */}
      <section className="mt-[20px]">
        <h2 className="text-[17px] leading-[1.4] font-black text-herb">나무 도감</h2>
        {numbered.length > 0 ? (
          <ul className="mt-3 grid grid-cols-3 gap-x-2.5 gap-y-4">
            {numbered.map(({ treeId, number, completedAt, fallenCount }) => {
              const { month, day } = parseDate(completedAt)
              return (
                <li key={treeId}>
                  <button
                    type="button"
                    onClick={() => setOpenId(treeId)}
                    className="flex w-full flex-col items-center rounded-2xl bg-coconut-100 px-2 pt-3 pb-2.5 shadow-[0_4px_0_var(--color-coconut-600)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-none"
                  >
                    <img src={getSeasonTree(month)} alt="" className="w-[72px]" />
                    <span className="mt-1.5 text-[13px] font-bold text-herb">
                      {number}번째 나무
                    </span>
                    <span className="text-tag font-medium text-herb-300">
                      {month}월 {day}일{fallenCount === 0 && ' · 🏅'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-3 rounded-2xl bg-coconut-100 py-8 text-center text-body text-herb-300">
            아직 완성한 나무가 없어요
            <br />
            도토리 7개를 모으면 첫 나무가 숲에 심어져요
          </p>
        )}
      </section>

      {opened && (
        <TreeSheet
          number={opened.number}
          completedAt={opened.completedAt}
          fallenCount={opened.fallenCount}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  )
}

/** 나무를 누르면: 완성 날짜 · 떨어진 도토리 수 */
function TreeSheet({
  number,
  completedAt,
  fallenCount,
  onClose,
}: {
  number: number
  completedAt: string
  fallenCount: number
  onClose: () => void
}) {
  const { year, month, day } = parseDate(completedAt)

  return (
    <BottomSheet open onClose={onClose} labelledBy="tree-sheet-title">
      <h2 id="tree-sheet-title" className="text-title text-herb">
        {number}번째 나무
      </h2>
      <img src={getSeasonTree(month)} alt="" className="mx-auto w-[160px]" />
      <ul className="grid grid-cols-2 gap-2 text-center">
        <li className="rounded-2xl bg-avocado-100 py-3">
          <p className="text-sub text-herb-300">완성한 날</p>
          <p className="text-[17px] font-bold text-herb">
            {year}년 {month}월 {day}일
          </p>
        </li>
        <li className="rounded-2xl bg-apricot-100 py-3">
          <p className="text-sub text-apricot-600">떨어진 도토리</p>
          <p className="text-[17px] font-bold text-apricot-800">
            <span aria-hidden>🌰</span> {fallenCount}개
          </p>
        </li>
      </ul>
      <p className="text-center text-body text-herb-400">
        {fallenCount === 0
          ? '🏅 한 번도 도토리를 떨어뜨리지 않고 키운 나무예요'
          : `학습이 끊겨 도토리 ${fallenCount}개를 떨어뜨렸지만 끝까지 키웠어요`}
      </p>
    </BottomSheet>
  )
}
