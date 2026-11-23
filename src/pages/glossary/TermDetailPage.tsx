/** 용어 상세: 쉬운 설명 · 예시 · 출처 + 단어장 저장 · AI 튜터 */
import clsx from 'clsx'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'

import { ApiError } from '@/api/client'
import { getTerm, parseTermId, type TermDetail } from '@/api/terms'
import { Button, LoadError, Loading, PageHeader } from '@/components/common'
import { useApi } from '@/hooks/useApi'
import { toggleBookmark, useBookmarks } from '@/hooks/useBookmarks'
import { addRecentTerm } from '@/hooks/useRecentTerms'
import { ROUTES } from '@/router/routes'

export default function TermDetailPage() {
  const termId = parseTermId(useParams().termId)
  const term = useApi(
    (signal) => (termId ? getTerm(termId, signal) : Promise.reject(NOT_FOUND)),
    String(termId),
  )

  if (term.status === 'loading') {
    return (
      <div className="flex flex-1 flex-col gap-gap">
        <PageHeader title="용어" />
        <Loading />
      </div>
    )
  }
  if (term.status === 'error') {
    return (
      <div className="flex flex-1 flex-col gap-gap">
        <PageHeader title="용어" />
        {term.error.status === 404 ? (
          <NotReady />
        ) : (
          <LoadError message={term.error.message} onRetry={term.reload} />
        )}
      </div>
    )
  }
  return <TermView term={term.data} />
}

/** 주소의 용어 번호가 숫자가 아닐 때 (서버에 묻지 않고 바로 '준비 중') */
const NOT_FOUND = new ApiError('아직 준비되지 않은 용어입니다', 'E404', 404)

function NotReady() {
  return (
    <>
      <p className="pt-16 text-center text-[17px] leading-[1.4] font-bold text-herb">
        아직 준비 중인 용어예요
      </p>
      <p className="text-center text-[13px] leading-[1.4] text-avocado-400">
        용어는 계속 추가하고 있어요
      </p>
    </>
  )
}

function TermView({ term }: { term: TermDetail }) {
  const navigate = useNavigate()
  const bookmarks = useBookmarks()
  // 단어장 목록을 받기 전에는 용어 조회 응답의 bookmarked를 쓴다
  const on = bookmarks.status === 'ready' ? bookmarks.ids.has(term.termId) : term.bookmarked

  useEffect(() => {
    addRecentTerm(term)
  }, [term])

  return (
    <div className="flex flex-1 flex-col gap-gap">
      <PageHeader title="용어" />

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          aria-pressed={on}
          disabled={bookmarks.status === 'loading'}
          onClick={() => toggleBookmark(term, on)}
          className={clsx(
            'text-[12px] leading-[1.4] font-bold',
            on ? 'text-apricot-700' : 'text-avocado-400',
          )}
        >
          {on ? '★ 단어장에 저장됨' : '☆ 단어장에 저장'}
        </button>
      </div>
      {bookmarks.error && (
        <p role="alert" className="text-right text-[12px] leading-[1.4] text-burnt-orange-600">
          {bookmarks.error}
        </p>
      )}

      <h1 className="text-[28px] leading-[1.2] font-black text-herb">{term.name}</h1>

      <section className="flex flex-col gap-1.5 rounded-[24px] bg-coconut-100 p-4 shadow-card">
        <h2 className="text-[12px] leading-[1.2] font-bold text-avocado-600">쉽게 말하면</h2>
        <p className="text-[15px] leading-[1.5] font-medium text-herb">{term.easyExplanation}</p>
      </section>

      {term.example && (
        <section className="flex flex-col gap-1.5 rounded-[24px] bg-apricot-100 p-4">
          <h2 className="text-[12px] leading-[1.2] font-bold text-apricot-700">예시</h2>
          <p className="text-[14px] leading-[1.5] text-apricot-800">{term.example}</p>
        </section>
      )}

      {term.reference && (
        <p className="text-[11px] leading-[1.2] font-medium text-avocado-400">
          출처 · {term.reference}
        </p>
      )}

      <div className="mt-auto pt-gap">
        <Button onClick={() => navigate(ROUTES.aiTutor(String(term.termId)))}>
          AI 튜터에게 묻기
        </Button>
      </div>
    </div>
  )
}
