/**
 * 오답노트: 다시 풀지 않고 해설만 본다.
 * - 주차별(‹ ›) + 섹터 필터
 * - '해설 보기' → 바텀시트 (내 답·정답, 해설, 출처, AI 튜터)
 */
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { BottomSheet, Button, Character, PageHeader, SectorChip } from '@/components/common'
import { SECTORS, type Sector } from '@/constants/sectors'
import { SOURCE } from '@/mocks/learn'
import { WRONG_NOTE_WEEKS, type WrongNoteItem } from '@/mocks/review'
import { ROUTES } from '@/router/routes'

type Filter = 'all' | Sector

export default function WrongNotePage() {
  const navigate = useNavigate()
  const [weekIndex, setWeekIndex] = useState(0)
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<WrongNoteItem | null>(null)

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

      <div className="flex h-11 items-center justify-between rounded-full bg-herb-100 px-2">
        <button
          type="button"
          aria-label="이전 주"
          disabled={!canPrev}
          onClick={() => setWeekIndex(weekIndex - 1)}
          className="size-8 rounded-full text-lg disabled:text-coconut-600"
        >
          ‹
        </button>
        <span className="text-card-title">
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
          className="size-8 rounded-full text-lg disabled:text-coconut-600"
        >
          ›
        </button>
      </div>

      {week.items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="섹터 필터">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                'shrink-0 rounded-full px-3 py-1.5 text-tag',
                filter === f.key
                  ? 'bg-apricot-600 text-coconut-100'
                  : 'bg-coconut-100 text-herb shadow-option',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {week.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Character size={110} />
          <p className="text-card-title">이번 주에는 틀린 문제가 없어요</p>
          {canPrev && (
            <p className="text-sub text-avocado-400">‹ 를 눌러 지난주 오답을 볼 수 있어요</p>
          )}
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-body text-avocado-400">
          이 섹터는 이번 주 오답이 없어요
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex flex-col gap-2 rounded-card bg-coconut-100 px-4 py-4 shadow-card"
            >
              <SectorChip sector={it.sector} className="self-start" />
              <p className="text-card-title">{it.question}</p>
              <div className="flex items-center justify-between">
                <span className="text-sub font-bold">정답 {it.correctAnswer}</span>
                <button
                  type="button"
                  onClick={() => setOpen(it)}
                  className="text-sub text-avocado-400"
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
              <SectorChip sector={open.sector} />
              <span className="text-tag font-medium text-avocado-400">
                {week.label} · {open.studiedAt}
              </span>
            </div>
            <h2 id="wrong-sheet-title" className="text-title">
              {open.question}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-option bg-burnt-orange-100 px-4 py-3">
                <p className="text-tag font-medium text-burnt-orange-600">내 답</p>
                <p className="text-[22px] font-black text-burnt-orange-700">{open.myAnswer}</p>
              </div>
              <div className="rounded-option bg-avocado-100 px-4 py-3">
                <p className="text-tag font-medium text-avocado-600">정답</p>
                <p className="text-[22px] font-black text-avocado-700">{open.correctAnswer}</p>
              </div>
            </div>
            <p className="text-body">{open.explanation}</p>
            <p className="text-tag font-medium text-avocado-400">출처 · {SOURCE}</p>
            <Button variant="secondary" onClick={() => navigate(ROUTES.aiTutor(open.termId))}>
              AI 튜터에게 물어보기
            </Button>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="h-btn text-card-title text-coconut-800"
            >
              닫기
            </button>
          </>
        )}
      </BottomSheet>
    </div>
  )
}
