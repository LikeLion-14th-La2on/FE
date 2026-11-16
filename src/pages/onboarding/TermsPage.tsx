/** 약관 동의: 전체 동의 + 필수 약관 2개. 필수 약관에 모두 동의해야 다음(닉네임)으로 이동 */
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

type TermKey = 'service' | 'privacy'

type Term = { key: TermKey; label: string; title: string; content: string }

// TODO: 실제 약관 전문으로 교체
const TERMS: Term[] = [
  {
    key: 'service',
    label: '[필수] 서비스 이용약관',
    title: '서비스 이용약관',
    content: '서비스 이용약관 내용이 들어갈 자리예요.',
  },
  {
    key: 'privacy',
    label: '[필수] 개인정보 수집·이용',
    title: '개인정보 수집·이용 동의',
    content: '개인정보 수집·이용 동의 내용이 들어갈 자리예요.',
  },
]

export default function TermsPage() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState<Record<TermKey, boolean>>({ service: false, privacy: false })
  const allAgreed = TERMS.every(({ key }) => agreed[key])
  const [openTerm, setOpenTerm] = useState<Term | null>(null)

  const toggleAll = () => setAgreed({ service: !allAgreed, privacy: !allAgreed })
  const toggle = (key: TermKey) => setAgreed((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSubmit = () => {
    // TODO: 약관 동의 저장 API 연결 후 이동
    navigate(ROUTES.nickname, { replace: true })
  }

  return (
    <>
      {/* 뒤로 가면 카카오 인가 페이지로 돌아가므로, 로그인 화면으로 바로 보낸다 */}
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => navigate(ROUTES.login, { replace: true })}
        className="flex h-10 w-10 items-center text-herb"
      >
        <BackIcon className="w-[19px]" />
      </button>

      <h1 className="mt-5 text-question">
        도토리치 이용을 위해
        <br />
        약관에 동의해 주세요
      </h1>

      <div className="mt-gap rounded-card bg-coconut-100 p-gutter shadow-card">
        <button
          type="button"
          role="checkbox"
          aria-checked={allAgreed}
          onClick={toggleAll}
          className="flex items-center gap-[11px]"
        >
          <CheckBadge checked={allAgreed} />
          <span className="text-card-title">전체 동의</span>
        </button>

        <hr className="my-[15px] border-t-2 border-avocado-500" />

        <ul className="flex flex-col gap-4">
          {TERMS.map((term) => {
            const { key, label } = term
            return (
              <li key={key} className="flex items-center justify-between">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreed[key]}
                  onClick={() => toggle(key)}
                  className="flex items-center gap-[11px]"
                >
                  <CheckBadge checked={agreed[key]} />
                  <span className="text-body">{label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpenTerm(term)}
                  className="text-sub text-herb-300"
                >
                  보기
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <Button
        className="mt-auto enabled:bg-avocado-500 enabled:shadow-[0_4px_0_var(--color-avocado-700)]"
        disabled={!allAgreed}
        onClick={handleSubmit}
      >
        동의하고 계속하기
      </Button>

      {openTerm && <TermDialog term={openTerm} onClose={() => setOpenTerm(null)} />}
    </>
  )
}

/** 약관 전문 팝업: 바깥(어두운 부분)·닫기 버튼·ESC로 닫힌다 */
function TermDialog({ term, onClose }: { term: Term; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    // 팝업이 떠 있는 동안 뒤 화면이 같이 스크롤되지 않게 막음
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-herb-900/40 px-gutter"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="term-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[70dvh] w-full max-w-[350px] flex-col gap-gap rounded-card bg-coconut-100 p-gutter shadow-card"
      >
        <h2 id="term-dialog-title" className="text-card-title">
          {term.title}
        </h2>
        <div className="overflow-y-auto text-body whitespace-pre-line">{term.content}</div>
        <Button onClick={onClose}>닫기</Button>
      </div>
    </div>
  )
}

/** 체크 표시가 들어간 알약형 배지 **/
function CheckBadge({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'flex h-7 w-[34px] items-center justify-center rounded-full',
        checked ? 'bg-herb-500 text-coconut-500' : 'bg-herb-100 text-herb-700',
      )}
    >
      <svg viewBox="189 496 26 28" className="w-[10px]" fill="currentColor">
        <path d="M195.948 523.248C195.449 521.861 194.908 520.561 194.323 519.347C193.759 518.112 193.142 516.921 192.47 515.772C191.798 514.624 191.04 513.454 190.195 512.262L193.25 510.247C194.268 511.742 195.157 513.292 195.915 514.895C196.673 516.477 197.356 518.048 197.963 519.607H198.093C198.743 517.397 199.512 515.242 200.4 513.14C201.31 511.017 202.296 508.991 203.358 507.062C204.441 505.112 205.589 503.303 206.802 501.635C208.038 499.967 209.305 498.482 210.605 497.182L213.562 499.782C211.829 501.407 210.15 503.336 208.525 505.567C206.9 507.799 205.394 510.345 204.008 513.205C202.643 516.043 201.473 519.207 200.498 522.695L195.948 523.248Z" />
      </svg>
    </span>
  )
}
