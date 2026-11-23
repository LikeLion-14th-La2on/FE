/**
 * 약관 동의: 전체 동의 + 필수 약관 2개. 필수 약관에 모두 동의해야 다음(닉네임)으로 이동
 * - '동의하고 계속하기' → 약관 동의 저장(POST /users/me/terms) 성공하면 닉네임 화면
 * - 실패하면 버튼 위에 서버 메시지를 보여 주고, 다시 누를 수 있다
 */
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { ApiError } from '@/api/client'
import { agreeTerms } from '@/api/user'
import { Button } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

type TermKey = 'service' | 'privacy'

type Term = { key: TermKey; label: string; title: string; content: string }

/**
 * 약관 전문 (팝업에서 줄바꿈 그대로 보여 준다)
 * - 팀에서 작성한 초안. 시행일 · 운영 주체 · 수집 항목은 실제 서비스에 맞게 확인할 것
 */
const SERVICE_TERMS = `제1조 (목적)
이 약관은 La2on(이하 "운영자")이 제공하는 금융 학습 서비스 "도토리치"(이하 "서비스")의 이용 조건과 절차, 운영자와 회원의 권리 · 의무를 정합니다.

제2조 (용어의 정의)
1. "회원"이란 이 약관에 동의하고 카카오 계정으로 가입해 서비스를 이용하는 사람을 말합니다.
2. "도토리"란 학습 · 출석 등 서비스 안의 활동으로 얻는 서비스 내 포인트를 말합니다.
3. "캐릭터"란 도토리로 얻거나 장착할 수 있는 서비스 내 꾸미기 요소를 말합니다.

제3조 (약관의 효력과 변경)
1. 이 약관은 서비스 화면에 게시하고 회원이 동의함으로써 효력이 생깁니다.
2. 운영자는 관련 법령을 위반하지 않는 범위에서 약관을 바꿀 수 있으며, 바꾸는 경우 시행 7일 전부터 서비스 안에 알립니다.
3. 회원은 바뀐 약관에 동의하지 않으면 탈퇴할 수 있습니다.

제4조 (회원 가입과 탈퇴)
1. 회원 가입은 카카오 계정으로 로그인한 뒤 이 약관과 개인정보 수집 · 이용에 동의하면 완료됩니다.
2. 회원은 언제든지 마이페이지에서 탈퇴할 수 있습니다. 탈퇴하면 학습 기록 · 도토리 · 캐릭터 등 계정의 모든 정보가 삭제되고 되살릴 수 없습니다.

제5조 (서비스의 내용)
1. 운영자는 다음 서비스를 제공합니다.
 - 금융 용어 · 개념 학습과 문제 풀이
 - 레벨 테스트, 복습, 오답노트
 - AI 튜터, 금융 계산 도구
 - 도토리 · 캐릭터 · 나무 키우기 등 학습 보상
2. 운영자는 서비스 개선을 위해 내용을 바꾸거나, 점검 · 장애 등의 사유로 서비스를 일시 중단할 수 있습니다.

제6조 (도토리와 캐릭터)
1. 도토리와 캐릭터는 서비스 안에서만 쓸 수 있으며, 현금이나 다른 재화로 바꾸거나 다른 사람에게 넘길 수 없습니다.
2. 부정한 방법으로 얻은 도토리 · 캐릭터는 회수할 수 있습니다.

제7조 (학습 정보에 대한 안내)
1. 서비스의 학습 내용 · AI 튜터 답변 · 금융 계산 결과는 금융 지식을 배우기 위한 참고 자료이며, 투자 · 대출 등 금융 상품에 대한 권유나 조언이 아닙니다.
2. 금융 계산 도구의 결과는 단순화한 조건으로 계산한 것으로, 실제 금융기관의 조건과 다를 수 있습니다.
3. 회원이 서비스 정보를 바탕으로 내린 금융 결정의 결과는 회원 본인에게 있습니다.

제8조 (회원의 의무)
회원은 다음 행위를 해서는 안 됩니다.
 - 다른 사람의 계정을 쓰거나 정보를 도용하는 행위
 - 비정상적인 방법으로 도토리 · 보상을 얻는 행위
 - 서비스 운영을 방해하거나 서버에 무리를 주는 행위
 - 타인을 비방하거나 법령에 어긋나는 내용을 입력하는 행위 (닉네임 · AI 튜터 질문 등)

제9조 (이용 제한)
회원이 제8조를 어기면 운영자는 경고, 이용 정지, 강제 탈퇴 등의 조치를 할 수 있습니다.

제10조 (책임의 제한)
운영자는 천재지변, 회원의 잘못, 운영자가 통제할 수 없는 사유로 생긴 손해에 대해서는 책임지지 않습니다.

부칙
이 약관은 2026년 11월 23일부터 시행합니다.`

const PRIVACY_TERMS = `La2on은 도토리치 서비스 제공을 위해 아래와 같이 개인정보를 수집 · 이용합니다.

1. 수집 · 이용 목적
 - 회원 식별, 가입 · 로그인 및 탈퇴 처리
 - 학습 진도 · 레벨 테스트 결과에 맞춘 학습 제공
 - 도토리 · 캐릭터 · 연속 학습 등 보상 기록 관리
 - 서비스 개선과 오류 확인

2. 수집 항목
 - 필수: 카카오 회원 번호, 닉네임
 - 서비스 이용 중 생성되는 정보: 학습 · 문제 풀이 기록, 레벨 테스트 결과, 오답 기록, 도토리 · 캐릭터 내역, AI 튜터 질문 내용, 접속 기록

3. 보유 · 이용 기간
 - 회원 탈퇴 시까지 보유하며, 탈퇴하면 지체 없이 파기합니다.
 - 단, 관련 법령에 따라 보관해야 하는 정보는 그 기간 동안 보관합니다.

4. 동의를 거부할 권리
 - 개인정보 수집 · 이용에 동의하지 않을 수 있습니다.
 - 다만 서비스 제공에 꼭 필요한 정보이므로, 동의하지 않으면 회원 가입과 서비스 이용이 불가능합니다.`

const TERMS: Term[] = [
  {
    key: 'service',
    label: '[필수] 서비스 이용약관',
    title: '서비스 이용약관',
    content: SERVICE_TERMS,
  },
  {
    key: 'privacy',
    label: '[필수] 개인정보 수집·이용',
    title: '개인정보 수집·이용 동의',
    content: PRIVACY_TERMS,
  },
]

export default function TermsPage() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState<Record<TermKey, boolean>>({ service: false, privacy: false })
  const allAgreed = TERMS.every(({ key }) => agreed[key])
  const [openTerm, setOpenTerm] = useState<Term | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleAll = () => setAgreed({ service: !allAgreed, privacy: !allAgreed })
  const toggle = (key: TermKey) => setAgreed((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSubmit = () => {
    if (!allAgreed || sending) return
    setSending(true)
    setError(null)
    agreeTerms({ serviceTerms: agreed.service, privacyPolicy: agreed.privacy })
      .then(() => navigate(ROUTES.nickname, { replace: true }))
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? e.message : '잠시 후 다시 시도해 주세요')
        setSending(false)
      })
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

      <div className="mt-auto flex flex-col gap-3">
        {error && (
          <p role="alert" className="text-center text-sub text-burnt-orange-600">
            {error}
          </p>
        )}
        <Button
          className="enabled:bg-avocado-500 enabled:shadow-[0_4px_0_var(--color-avocado-700)]"
          disabled={!allAgreed || sending}
          onClick={handleSubmit}
        >
          {sending ? '저장하고 있어요' : '동의하고 계속하기'}
        </Button>
      </div>

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
        {/* 긴 약관은 이 칸만 스크롤, 한글은 단어 중간에서 줄이 안 바뀌게 */}
        <div className="min-h-0 overflow-y-auto text-body break-keep whitespace-pre-line">
          {term.content}
        </div>
        {/* 내용이 길어도 닫기 버튼이 눌려 납작해지지 않게 */}
        <Button className="shrink-0" onClick={onClose}>
          닫기
        </Button>
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
