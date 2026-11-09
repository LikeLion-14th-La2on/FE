/** 용어사전: 검색 + 전체 용어 / 내 단어장(★) */
import clsx from 'clsx'
import { useState } from 'react'
import { Link } from 'react-router'

import { PageHeader, SectorChip } from '@/components/common'
import { toggleBookmark, useBookmarks } from '@/hooks/useBookmarks'
import { TERMS } from '@/mocks/learn'
import { ROUTES } from '@/router/routes'

type Tab = 'all' | 'saved'

export default function GlossaryPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const saved = useBookmarks()

  const q = query.trim()
  const list = Object.values(TERMS).filter(
    (t) =>
      (tab === 'all' || saved.has(t.id)) && (!q || t.name.includes(q) || t.meaning.includes(q)),
  )

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title="용어사전" />

      <label className="flex items-center gap-2 rounded-card bg-coconut-100 py-2 pr-2 pl-4 shadow-card">
        <span className="sr-only">용어 검색</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="용어 검색 (예: 복리, PER)"
          className="min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-avocado-300"
        />
        <span className="rounded-full bg-apricot-600 px-3 py-1.5 text-tag text-coconut-100">
          검색
        </span>
      </label>

      <div className="flex gap-2" role="tablist">
        {(
          [
            ['all', '전체 용어'],
            ['saved', `★ 내 단어장 ${saved.size}`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={clsx(
              'rounded-full px-3 py-1.5 text-tag',
              tab === key
                ? 'bg-apricot-600 text-coconut-100'
                : 'bg-coconut-100 text-herb shadow-option',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-card-title">
            {q ? `‘${q}’는 아직 준비 중인 용어예요` : '단어장에 저장한 용어가 없어요'}
          </p>
          <p className="text-sub text-avocado-400">
            {q ? '용어는 계속 추가하고 있어요' : '용어 옆 ☆를 눌러 저장해 보세요'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((t) => {
            const on = saved.has(t.id)
            return (
              <li key={t.id} className="relative rounded-card bg-coconut-100 shadow-card">
                <Link
                  to={ROUTES.glossaryTerm(t.id)}
                  className="flex flex-col gap-1.5 px-4 py-4 pr-20"
                >
                  <SectorChip sector={t.sector} className="self-start" />
                  <span className="text-card-title">{t.name}</span>
                  <span className="text-sub text-avocado-400">{t.meaning}</span>
                </Link>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={on ? `${t.name} 단어장에서 빼기` : `${t.name} 단어장에 저장`}
                  onClick={() => toggleBookmark(t.id)}
                  className={clsx(
                    'absolute right-3 bottom-3 rounded-full px-2.5 py-1 text-tag',
                    on ? 'text-apricot-700' : 'text-avocado-400',
                  )}
                >
                  {on ? '★ 저장됨' : '☆ 저장'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
