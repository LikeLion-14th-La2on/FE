/**
 * 용어사전: 검색 + 전체 용어 / 내 단어장(★) / 최근 본 용어
 * - 전체 용어: 입력이 멈추고 0.3초 뒤 서버 검색 (이름 부분 일치). 전체 목록 API가 없어 검색어가 없으면 추천 검색어를 보여 준다
 * - 내 단어장 · 최근 본 용어: 검색어가 있으면 그 안에서 거른다
 * 용어 상세에 갔다가 뒤로 오면 검색어·탭·스크롤 위치 그대로 돌아온다.
 */
import clsx from 'clsx'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import { searchTerms, type TermSummary } from '@/api/terms'
import { LoadError, PageHeader } from '@/components/common'
import { useApi } from '@/hooks/useApi'
import { loadBookmarks, toggleBookmark, useBookmarks } from '@/hooks/useBookmarks'
import { useRecentTerms } from '@/hooks/useRecentTerms'
import { saveReturnSnapshot, useReturnSnapshot } from '@/hooks/useReturnSnapshot'
import { ROUTES } from '@/router/routes'

type Tab = 'all' | 'saved' | 'recent'

/** 검색어가 없을 때 눌러 볼 수 있는 추천 검색어 */
const SUGGESTIONS = ['복리', 'PER', '전세가율', '금리']
/** 입력이 멈춘 뒤 검색까지 기다리는 시간 */
const SEARCH_DELAY = 300

/** 용어 상세에 다녀오는 동안 보관할 화면 상태 */
type Snapshot = { query: string; tab: Tab }
const SNAPSHOT_KEY = 'glossary-snapshot'

export default function GlossaryPage() {
  const back = useReturnSnapshot<Snapshot>(SNAPSHOT_KEY)
  const [query, setQuery] = useState(back?.query ?? '')
  const [tab, setTab] = useState<Tab>(back?.tab ?? 'all')
  const keepState = () => saveReturnSnapshot<Snapshot>(SNAPSHOT_KEY, { query, tab })
  const bookmarks = useBookmarks()
  const recent = useRecentTerms()

  const q = query.trim()
  const [keyword, setKeyword] = useState(q)
  useEffect(() => {
    const timer = window.setTimeout(() => setKeyword(q), SEARCH_DELAY)
    return () => window.clearTimeout(timer)
  }, [q])
  const search = useApi(
    (signal) => (tab === 'all' && keyword ? searchTerms(keyword, signal) : Promise.resolve([])),
    tab === 'all' ? keyword : '',
  )

  const matches = (t: TermSummary) => !q || t.name.includes(q) || t.easyExplanation.includes(q)

  const tabs: [Tab, string][] = [
    ['all', '전체 용어'],
    ['saved', `★ 내 단어장 ${bookmarks.ids.size}`],
    ['recent', '최근 본 용어'],
  ]

  const renderBody = () => {
    if (tab === 'all') {
      if (!q) {
        return (
          <Empty title="궁금한 용어를 검색해 보세요" sub="이런 용어부터 찾아볼까요?">
            {SUGGESTIONS.map((s) => (
              <Chip key={s} onClick={() => setQuery(s)}>
                {s}
              </Chip>
            ))}
          </Empty>
        )
      }
      if (search.status === 'error') {
        return <LoadError message={search.error.message} onRetry={search.reload} />
      }
      // 입력 중이거나 응답 전이면 이전 결과 대신 '찾는 중'
      if (keyword !== q || search.status === 'loading') {
        return (
          <p role="status" className="py-8 text-center text-[13px] leading-[1.4] text-avocado-400">
            찾고 있어요 · · ·
          </p>
        )
      }
      if (search.data.length === 0) {
        return (
          <Empty
            title={`‘${q}’는 아직 준비 중인 용어예요`}
            sub="용어는 계속 추가하고 있어요. 다른 이름으로도 찾아보세요"
          />
        )
      }
      return <TermList terms={search.data} saved={bookmarks.ids} onOpen={keepState} />
    }

    if (tab === 'saved') {
      if (bookmarks.status === 'error') {
        return <LoadError message="단어장을 불러오지 못했어요" onRetry={loadBookmarks} />
      }
      if (bookmarks.status !== 'ready') {
        return (
          <p role="status" className="py-8 text-center text-[13px] leading-[1.4] text-avocado-400">
            불러오고 있어요 · · ·
          </p>
        )
      }
      const list = bookmarks.items.filter(matches)
      if (list.length === 0) {
        return q ? (
          <Empty title={`단어장에 ‘${q}’가 없어요`} sub="전체 용어에서 찾아보세요" />
        ) : (
          <Empty title="단어장에 저장한 용어가 없어요" sub="용어 옆 ☆를 눌러 저장해 보세요" />
        )
      }
      return <TermList terms={list} saved={bookmarks.ids} onOpen={keepState} />
    }

    const list = recent.filter(matches)
    if (list.length === 0) {
      return q ? (
        <Empty title={`최근 본 용어에 ‘${q}’가 없어요`} sub="전체 용어에서 찾아보세요" />
      ) : (
        <Empty title="아직 본 용어가 없어요" sub="용어를 누르면 여기에 모여요" />
      )
    }
    return <TermList terms={list} saved={bookmarks.ids} onOpen={keepState} />
  }

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title="용어사전" />

      <label className="flex items-center gap-2 rounded-[24px] bg-coconut-100 px-4 py-3 shadow-card">
        <span className="sr-only">용어 검색</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="용어 검색 (예: 복리, PER)"
          className="min-w-0 flex-1 bg-transparent text-[14px] leading-[1.4] font-medium text-herb outline-none placeholder:font-normal placeholder:text-avocado-400"
        />
        <span className="rounded-[12px] bg-apricot-600 px-3 py-1.5 text-[11.2px] leading-[1.4] font-bold text-coconut-500">
          검색
        </span>
      </label>

      <div className="flex flex-wrap gap-1.5" role="tablist">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={clsx(
              'rounded-full px-3 py-1.5 text-[12px] leading-[1.4] font-bold',
              tab === key ? 'bg-apricot-600 text-coconut-500' : 'bg-coconut-100 text-herb',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {bookmarks.error && (
        <p role="alert" className="text-[12px] leading-[1.4] text-burnt-orange-600">
          {bookmarks.error}
        </p>
      )}

      {renderBody()}
    </div>
  )
}

/** 용어 카드 목록 (누르면 상세, 오른쪽 아래 ☆ 저장) */
function TermList({
  terms,
  saved,
  onOpen,
}: {
  terms: TermSummary[]
  saved: Set<number>
  onOpen: () => void
}) {
  return (
    <ul className="flex flex-col gap-gap">
      {terms.map((t) => {
        const on = saved.has(t.termId)
        return (
          <li key={t.termId} className="relative rounded-[24px] bg-coconut-100 shadow-card">
            <Link
              to={ROUTES.glossaryTerm(String(t.termId))}
              onClick={onOpen}
              className="flex flex-col gap-1.5 p-4 pr-[72px]"
            >
              <span className="text-[15px] leading-[1.4] font-bold text-herb">{t.name}</span>
              <span className="text-[13px] leading-[1.4] text-herb-500">{t.easyExplanation}</span>
            </Link>
            <button
              type="button"
              aria-pressed={on}
              aria-label={on ? `${t.name} 단어장에서 빼기` : `${t.name} 단어장에 저장`}
              onClick={() => toggleBookmark(t, on)}
              className="absolute right-4 bottom-4 text-[13px] leading-[1.4] font-medium text-avocado-400"
            >
              {on ? '★' : '☆'} 저장
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Empty({ title, sub, children }: { title: string; sub: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-4 py-8 text-center">
      <p className="text-[17px] leading-[1.4] font-bold text-herb">{title}</p>
      <p className="text-[13px] leading-[1.4] text-avocado-400">{sub}</p>
      {children && <div className="flex flex-wrap justify-center gap-1.5">{children}</div>}
    </div>
  )
}

function Chip({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-avocado-100 px-3 py-1.5 text-[12px] leading-[1.4] font-bold text-herb"
    >
      {children}
    </button>
  )
}
