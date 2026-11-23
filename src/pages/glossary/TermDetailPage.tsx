/** 용어 상세: 쉬운 설명 · 예시 · 관련 용어 · 출처 */
import clsx from 'clsx'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'

import { Button, PageHeader, SectorChip } from '@/components/common'
import { SECTOR_TEXT } from '@/constants/sectorText'
import { toggleBookmark, useBookmarks } from '@/hooks/useBookmarks'
import { addRecentTerm } from '@/hooks/useRecentTerms'
import { SOURCE, TODAY, getTerm } from '@/mocks/learn'
import { ROUTES } from '@/router/routes'

export default function TermDetailPage() {
  const navigate = useNavigate()
  const term = getTerm(useParams().termId)
  const saved = useBookmarks()

  useEffect(() => {
    if (term) addRecentTerm(term.id)
  }, [term])

  if (!term) {
    return (
      <div className="flex flex-1 flex-col gap-gap">
        <PageHeader title="용어" />
        <p className="pt-16 text-center text-[17px] leading-[1.4] font-bold text-herb">
          아직 준비 중인 용어예요
        </p>
      </div>
    )
  }

  const on = saved.has(term.id)

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title="용어" />

      <div className="flex items-center justify-between gap-2">
        <SectorChip
          sector={term.sector}
          className={clsx('px-3! py-1.5! text-[12px]!', SECTOR_TEXT[term.sector])}
        />
        <button
          type="button"
          aria-pressed={on}
          onClick={() => toggleBookmark(term.id)}
          className={clsx(
            'text-[12px] leading-[1.4] font-bold',
            on ? 'text-apricot-700' : 'text-avocado-400',
          )}
        >
          {on ? '★ 단어장에 저장됨' : '☆ 단어장에 저장'}
        </button>
      </div>

      <h1 className="text-[28px] leading-[1.2] font-black text-herb">{term.name}</h1>

      <section className="flex flex-col gap-1.5 rounded-[24px] bg-coconut-100 p-4 shadow-card">
        <h2 className="text-[12px] leading-[1.2] font-bold text-avocado-600">쉽게 말하면</h2>
        <p className="text-[15px] leading-[1.5] font-medium text-herb">{term.meaning}</p>
      </section>

      <section className="flex flex-col gap-1.5 rounded-[24px] bg-apricot-100 p-4">
        <h2 className="text-[12px] leading-[1.2] font-bold text-apricot-700">예시</h2>
        <p className="text-[14px] leading-[1.5] text-apricot-800">{term.example}</p>
      </section>

      <h2 className="text-[13px] leading-[1.2] font-bold text-herb">같이 알아두면 좋은 용어</h2>
      <ul className="flex flex-wrap gap-1.5">
        {term.related.map((r) => (
          <li
            key={r}
            className="rounded-full bg-avocado-100 px-3 py-1.5 text-[12px] leading-[1.2] font-bold text-herb"
          >
            {r}
          </li>
        ))}
      </ul>

      <p className="text-[11px] leading-[1.2] font-medium text-avocado-400">출처 · {SOURCE}</p>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-gap">
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.termPreview(term.sector, TODAY.stage))}
        >
          이 용어 문제 풀기
        </Button>
        <Button onClick={() => navigate(ROUTES.aiTutor(term.id))}>AI 튜터에게 묻기</Button>
      </div>
    </div>
  )
}
