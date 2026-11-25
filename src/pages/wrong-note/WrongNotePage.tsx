/**
 * 오답노트: 다시 풀지 않고 해설만 본다 (GET /wrong-answers?week=)
 * - 주차별(‹ ›) + 섹터 필터. 처음엔 이번 주, 다음 주 화살표는 이번 주까지만.
 * - 섹터 필터는 받은 목록을 화면에서 거른다 (전체 개수도 함께 보여 줘야 해서).
 * - '해설 보기' → 바텀시트 (내 답·정답, 해설, 출처). 매칭은 짝마다 한 줄로 내 답·정답 비교.
 * - 응답에 문제의 용어 번호가 없어 시트의 AI 튜터 버튼은 아직 두지 않는다 (BE에 termIds 요청 예정).
 */
import clsx from 'clsx'
import { useState } from 'react'

import type { MatchingChoices } from '@/api/types'
import { toSector } from '@/api/types'
import { getWrongNotes, shiftWeek, type WrongNoteItem } from '@/api/wrongNote'
import {
  BottomSheet,
  Character,
  LoadError,
  Loading,
  PageHeader,
  SectorChip,
} from '@/components/common'
import { SECTOR_TEXT } from '@/constants/sectorText'
import { SECTORS, type Sector } from '@/constants/sectors'
import { useApi } from '@/hooks/useApi'
import { CIRCLED, SITUATION_PROMPT } from '@/pages/learn/quiz/answer'

type Filter = 'all' | Sector

const MATCHING_PROMPT = '용어와 뜻을 짝지어 보세요'

/** 카드·시트 제목: 상황형은 상황 설명 대신 고정 질문 */
const titleOf = (it: WrongNoteItem) =>
  it.type === 'SITUATION'
    ? SITUATION_PROMPT.replace('\n', ' ')
    : it.type === 'MATCHING'
      ? it.content || MATCHING_PROMPT
      : it.content

/** OX·객관식 답을 글자로: "X", "② 배당" */
function answerText(it: WrongNoteItem, value: unknown) {
  if (it.type === 'OX') return String(value)
  const i = Number(value)
  const option = Array.isArray(it.choices) ? it.choices[i] : undefined
  return option !== undefined ? `${CIRCLED[i]} ${option}` : String(value)
}

/** 매칭: 용어 순서대로 [용어, 내가 고른 뜻, 정답 뜻] */
function matchingRows(it: WrongNoteItem) {
  const mine = (it.myAnswer ?? {}) as Record<string, string>
  const right = (it.correctAnswer ?? {}) as Record<string, string>
  const terms = (it.choices as MatchingChoices | null)?.terms ?? Object.keys(right)
  return terms.map((term) => ({ term, mine: mine[term], right: right[term] }))
}

/** 목록 카드 아래 한 줄 요약 */
function summary(it: WrongNoteItem) {
  if (it.type !== 'MATCHING') return `정답 ${answerText(it, it.correctAnswer)}`
  const rows = matchingRows(it)
  const wrong = rows.filter((r) => r.mine !== r.right).length
  return `${rows.length}쌍 중 ${wrong}쌍 틀림`
}

/** wrongAt → "11월 3일" */
const dayLabel = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function WrongNotePage() {
  /** null = 이번 주 (서버가 정함) */
  const [week, setWeek] = useState<string | null>(null)
  const [thisWeek, setThisWeek] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<number | null>(null)

  const notes = useApi(
    async (signal) => {
      const data = await getWrongNotes(week, signal)
      if (week === null) setThisWeek(data.week)
      return data
    },
    `wrong-notes:${week ?? 'this'}`,
  )

  const data = notes.data
  const items = (data?.items ?? []).filter(
    (it) => filter === 'all' || toSector(it.sectorName) === filter,
  )
  const open = data?.items.find((it) => it.wrongAnswerId === openId) ?? null
  const current = data?.week ?? week
  const canPrev = current !== null
  const canNext = current !== null && thisWeek !== null && current < thisWeek

  const move = (delta: number) => {
    if (!current) return
    setOpenId(null)
    setWeek(shiftWeek(current, delta))
  }

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
          disabled={!canPrev || notes.status === 'loading'}
          onClick={() => move(-1)}
          className="flex h-full w-6 items-center justify-center text-herb disabled:text-coconut-600"
        >
          <Chevron dir="left" />
        </button>
        <span className="text-[15px] leading-[1.4] font-bold text-herb">
          {data
            ? `${data.weekLabel} · ${
                filter === 'all'
                  ? `전체 ${data.items.length}`
                  : `${SECTORS[filter].label} ${items.length}`
              }문제`
            : '불러오는 중'}
        </span>
        <button
          type="button"
          aria-label="다음 주"
          disabled={!canNext || notes.status === 'loading'}
          onClick={() => move(1)}
          className="flex h-full w-6 items-center justify-center text-herb disabled:text-coconut-600"
        >
          <Chevron dir="right" />
        </button>
      </div>

      {notes.status === 'loading' && <Loading label="오답노트를 불러오고 있어요" />}
      {notes.status === 'error' && (
        <LoadError message={notes.error.message} onRetry={notes.reload} />
      )}

      {data && data.items.length > 0 && (
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

      {data &&
        (data.items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 pt-12 pb-12 text-center">
            <Character width={96} pose="think" />
            <p className="text-[17px] leading-[1.4] font-bold text-herb">
              이 주에는 틀린 문제가 없어요
            </p>
            <p className="text-[13px] leading-[1.4] text-avocado-400">
              ‹ 를 눌러 지난주 오답을 볼 수 있어요
            </p>
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-[14px] leading-[1.4] text-avocado-400">
            이 섹터는 이 주에 오답이 없어요
          </p>
        ) : (
          <ul className="flex flex-col gap-gap">
            {items.map((it) => {
              const sector = toSector(it.sectorName)
              return (
                <li
                  key={it.wrongAnswerId}
                  className="flex flex-col gap-1.5 rounded-[24px] bg-coconut-100 p-4 shadow-card"
                >
                  <SectorChip
                    sector={sector}
                    className={clsx('self-start px-3! py-[5px]!', SECTOR_TEXT[sector])}
                  />
                  <p className="line-clamp-2 text-[15px] leading-[1.4] font-bold text-herb">
                    {it.type === 'SITUATION' ? it.content : titleOf(it)}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[13px] leading-[1.4] font-bold text-herb-500">
                      {summary(it)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenId(it.wrongAnswerId)}
                      className="shrink-0 text-[13px] leading-[1.4] font-medium text-avocado-400"
                    >
                      해설 보기 ›
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        ))}

      <BottomSheet
        open={open !== null}
        onClose={() => setOpenId(null)}
        labelledBy="wrong-sheet-title"
      >
        {open && data && (
          <>
            <div className="flex items-center gap-2">
              <SectorChip
                sector={toSector(open.sectorName)}
                className={clsx('px-3! py-[5px]!', SECTOR_TEXT[toSector(open.sectorName)])}
              />
              <span className="text-[12px] leading-[1.4] font-medium text-avocado-400">
                {data.weekLabel} · {dayLabel(open.wrongAt)}
              </span>
            </div>
            <h2 id="wrong-sheet-title" className="text-[20px] leading-[1.4] font-black text-herb">
              {titleOf(open)}
            </h2>
            {open.type === 'SITUATION' && (
              <p className="rounded-[16px] bg-apricot-100 px-3.5 py-2.5 text-[14px] leading-[1.4] text-apricot-800">
                {open.content}
              </p>
            )}

            {open.type === 'MATCHING' ? (
              <ul className="flex flex-col gap-1.5">
                {matchingRows(open).map((r) => {
                  const ok = r.mine === r.right
                  return (
                    <li
                      key={r.term}
                      className={clsx(
                        'flex flex-col gap-0.5 rounded-[16px] px-3.5 py-2.5 text-[13px] leading-[1.4]',
                        ok ? 'bg-avocado-100 text-herb' : 'bg-burnt-orange-100',
                      )}
                    >
                      <b className={clsx('text-[14px]', !ok && 'text-burnt-orange-700')}>
                        {r.term}
                      </b>
                      {ok ? (
                        <span>{r.right} ✓</span>
                      ) : (
                        <>
                          <span className="text-burnt-orange-700">내 답 · {r.mine ?? '-'}</span>
                          <span className="text-avocado-700">정답 · {r.right}</span>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-[3px] rounded-[16px] bg-burnt-orange-100 px-3.5 py-2.5">
                  <p className="text-[12px] leading-[1.4] font-medium text-burnt-orange-700">
                    내 답
                  </p>
                  <p
                    className={clsx(
                      'leading-[1.2] font-black text-burnt-orange-700',
                      open.type === 'OX' ? 'text-[22px]' : 'text-[16px]',
                    )}
                  >
                    {answerText(open, open.myAnswer)}
                  </p>
                </div>
                <div className="flex flex-col gap-[3px] rounded-[16px] bg-avocado-100 px-3.5 py-2.5">
                  <p className="text-[12px] leading-[1.4] font-medium text-avocado-700">정답</p>
                  <p
                    className={clsx(
                      'leading-[1.2] font-black text-avocado-700',
                      open.type === 'OX' ? 'text-[22px]' : 'text-[16px]',
                    )}
                  >
                    {answerText(open, open.correctAnswer)}
                  </p>
                </div>
              </div>
            )}

            <p className="text-[14px] leading-[1.5] text-herb">{open.explanation}</p>
            {open.reference && (
              <p className="text-[11px] leading-[1.4] font-medium text-avocado-400">
                출처 · {open.reference}
              </p>
            )}
            <button
              type="button"
              onClick={() => setOpenId(null)}
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
