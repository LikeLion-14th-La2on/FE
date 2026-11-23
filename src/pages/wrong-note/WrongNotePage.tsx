/**
 * 오답노트: 다시 풀지 않고 해설만 본다.
 * - 주차별(‹ ›) + 섹터 필터
 * - '해설 보기' → 바텀시트 (내 답·정답, 해설, 출처, AI 튜터)
 * - 시트에서 AI 튜터로 갔다가 뒤로 오면 보던 주차·필터·해설 시트 그대로 돌아온다.
 */
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button, Character, PageHeader, SectorChip } from '@/components/common'
import { SECTOR_TEXT } from '@/constants/sectorText'
import { SECTORS, type Sector } from '@/constants/sectors'
import { saveReturnSnapshot, useReturnSnapshot } from '@/hooks/useReturnSnapshot'
import { SOURCE } from '@/mocks/learn'
import { WRONG_NOTE_WEEKS, type WrongNoteItem } from '@/mocks/review'
import { ROUTES } from '@/router/routes'

type Filter = 'all' | Sector

/** AI 튜터에 다녀오는 동안 보관할 화면 상태 */
type Snapshot = { weekIndex: number; filter: Filter; openId: string | null }
const SNAPSHOT_KEY = 'wrong-note-snapshot'

export default function WrongNotePage() {
  const navigate = useNavigate()
  const saved = useReturnSnapshot<Snapshot>(SNAPSHOT_KEY)
  const [weekIndex, setWeekIndex] = useState(saved?.weekIndex ?? 0)
  const [filter, setFilter] = useState<Filter>(saved?.filter ?? 'all')
  const [open, setOpen] = useState<WrongNoteItem | null>(
    () => WRONG_NOTE_WEEKS[weekIndex]?.items.find((it) => it.id === saved?.openId) ?? null,
  )

  const week = WRONG_NOTE_WEEKS[weekIndex]
  const items = week.items.filter((it) => filter === 'all' || it.sector === filter)
  const canPrev = weekIndex > 0
  const canNext = weekIndex < WRONG_NOTE_WEEKS.length - 1

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: '전체' },
    ...(Object.keys(SECTORS) as Sector[]).map((s) => ({
      key: s,
      label: `${SECTORS[s].emoji} ${SECTORS[s].label}`,
    })),
  ]

  return (
    <div className="flex flex-col gap-gap">
      <PageHeader title="오답노트" />

      <div className="flex h-[45px] items-center justify-between rounded-[22.6px] bg-avocado-100 px-4">
        <button
          type="button"
          aria-label="이전 주"
          disabled={!canPrev}
          onClick={() => setWeekIndex(weekIndex - 1)}
          className="flex h-full w-6 items-center justify-center text-herb disabled:text-coconut-600"
        >
          <Chevron dir="left" />
        </button>
        <span className="text-[15px] leading-[1.4] font-bold text-herb">
          {week.label} ·{' '}
          {filter === 'all'
            ? `전체 ${week.items.length}`
            : `${SECTORS[filter].label} ${items.length}`}
          문제
        </span>
        <button
          type="button"
          aria-label="다음 주"
          disabled={!canNext}
          onClick={() => setWeekIndex(weekIndex + 1)}
          className="flex h-full w-6 items-center justify-center text-herb disabled:text-coconut-600"
        >
          <Chevron dir="right" />
        </button>
      </div>

      {week.items.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="섹터 필터">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-[12px] leading-[1.4] font-bold shadow-option',
                filter === f.key ? 'bg-apricot-600 text-coconut-500' : 'bg-coconut-100 text-herb',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {week.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 pt-12 pb-12 text-center">
          <Character width={96} />
          <p className="text-[17px] leading-[1.4] font-bold text-herb">
            이번 주에는 틀린 문제가 없어요
          </p>
          {canPrev && (
            <p className="text-[13px] leading-[1.4] text-avocado-400">
              ‹ 를 눌러 지난주 오답을 볼 수 있어요
            </p>
          )}
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-[14px] leading-[1.4] text-avocado-400">
          이 섹터는 이번 주 오답이 없어요
        </p>
      ) : (
        <ul className="flex flex-col gap-gap">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex flex-col gap-1.5 rounded-[24px] bg-coconut-100 p-4 shadow-card"
            >
              <SectorChip
                sector={it.sector}
                className={clsx('self-start px-3! py-[5px]!', SECTOR_TEXT[it.sector])}
              />
              <p className="text-[15px] leading-[1.4] font-bold text-herb">{it.question}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] leading-[1.4] font-bold text-herb-500">
                  정답 {it.correctAnswer}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(it)}
                  className="text-[13px] leading-[1.4] font-medium text-avocado-400"
                >
                  해설 보기 ›
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <BottomSheet
        open={open !== null}
        onClose={() => setOpen(null)}
        labelledBy="wrong-sheet-title"
      >
        {open && (
          <>
            <div className="flex items-center gap-2">
              <SectorChip
                sector={open.sector}
                className={clsx('px-3! py-[5px]!', SECTOR_TEXT[open.sector])}
              />
              <span className="text-[12px] leading-[1.4] font-medium text-avocado-400">
                {week.label} · {open.studiedAt}
              </span>
            </div>
            <h2 id="wrong-sheet-title" className="text-[20px] leading-[1.4] font-black text-herb">
              {open.question}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-[3px] rounded-[16px] bg-burnt-orange-100 px-3.5 py-2.5">
                <p className="text-[12px] leading-[1.4] font-medium text-burnt-orange-700">내 답</p>
                <p className="text-[22px] leading-[1.2] font-black text-burnt-orange-700">
                  {open.myAnswer}
                </p>
              </div>
              <div className="flex flex-col gap-[3px] rounded-[16px] bg-avocado-100 px-3.5 py-2.5">
                <p className="text-[12px] leading-[1.4] font-medium text-avocado-700">정답</p>
                <p className="text-[22px] leading-[1.2] font-black text-avocado-700">
                  {open.correctAnswer}
                </p>
              </div>
            </div>
            <p className="text-[14px] leading-[1.5] text-herb">{open.explanation}</p>
            <p className="text-[11px] leading-[1.4] font-medium text-avocado-400">
              출처 · {SOURCE}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                saveReturnSnapshot<Snapshot>(SNAPSHOT_KEY, { weekIndex, filter, openId: open.id })
                navigate(ROUTES.aiTutor(open.termId))
              }}
            >
              AI 튜터에게 물어보기
            </Button>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="h-btn text-[16px] leading-[1.4] font-bold text-avocado-400"
            >
              닫기
            </button>
          </>
        )}
      </BottomSheet>
    </div>
  )
}

/** 주차 이동 화살표: 글자(‹ ›)는 글꼴마다 세로 위치가 달라서 SVG로 그려 막대 가운데에 맞춘다 */
function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M6.5 1.5 1.5 6.5l5 5' : 'M1.5 1.5l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
