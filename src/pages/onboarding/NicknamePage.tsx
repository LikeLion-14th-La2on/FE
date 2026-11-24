/**
 * 닉네임 설정: 닉네임(최대 10자)을 입력하면 레벨 테스트 안내로 이동
 * - 형식(한글 · 영문 · 숫자 2~10자)부터 검사해서, 맞을 때만 중복 확인을 보낸다.
 * - 입력이 멈추고 0.3초 뒤 중복 확인(GET /users/check-nickname). 그 사이에 또 입력하면 이전 확인은 취소한다.
 * - 사용 가능한 닉네임일 때만 '다음'을 누를 수 있다.
 * - '다음' → 닉네임 등록(POST /users/me/nickname) 성공하면 레벨 테스트 안내로.
 *   확인 뒤 그 사이 다른 사람이 먼저 쓰면(E409) '이미 사용 중'으로 바꿔 보여 준다.
 */
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { ApiError } from '@/api/client'
import { checkNickname, registerNickname } from '@/api/user'
import { Button, Character } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import {
  isValidNickname,
  NICKNAME_MAX_LENGTH as MAX_LENGTH,
  NICKNAME_RULE_TEXT,
} from '@/constants/nickname'
import { ROUTES } from '@/router/routes'

/** 입력이 멈춘 뒤 중복 확인까지 기다리는 시간 */
const CHECK_DELAY = 300

type CheckStatus = 'available' | 'taken' | 'error'
/** 어떤 닉네임을 확인한 결과인지 같이 기억한다 (입력이 바뀌면 이전 결과는 안 쓴다) */
type Check = { nickname: string; status: CheckStatus; message?: string }

const CHECK_TEXT: Record<
  CheckStatus | 'checking' | 'invalid',
  { text: string; className: string }
> = {
  invalid: { text: NICKNAME_RULE_TEXT, className: 'text-burnt-orange-600' },
  checking: { text: '확인하고 있어요', className: 'text-herb-300' },
  available: { text: '✓ 사용 가능한 닉네임이에요', className: 'text-avocado-500' },
  taken: { text: '이미 사용 중인 닉네임이에요', className: 'text-burnt-orange-600' },
  error: { text: '잠시 후 다시 시도해 주세요', className: 'text-burnt-orange-600' },
}

/** 실패한 요청을 화면에 보여 줄 결과로 (E409는 '이미 사용 중', 그 밖은 서버 메시지) */
function toCheck(nickname: string, e: unknown): Check {
  if (e instanceof ApiError && e.code === 'E409') return { nickname, status: 'taken' }
  return { nickname, status: 'error', message: e instanceof ApiError ? e.message : undefined }
}

export default function NicknamePage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const trimmed = nickname.trim()
  const [check, setCheck] = useState<Check | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!isValidNickname(trimmed)) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      checkNickname(trimmed, controller.signal)
        .then(({ available }) =>
          setCheck({ nickname: trimmed, status: available ? 'available' : 'taken' }),
        )
        .catch((e: unknown) => {
          if (!controller.signal.aborted) setCheck(toCheck(trimmed, e))
        })
    }, CHECK_DELAY)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed])

  // 빈칸이면 안내 없음, 지금 입력에 대한 결과가 아직 없으면 '확인 중'
  // 빈칸이면 안내 없음 → 형식이 틀리면 규칙 안내 → 지금 입력에 대한 결과가 아직 없으면 '확인 중'
  const status = !trimmed
    ? null
    : !isValidNickname(trimmed)
      ? 'invalid'
      : check?.nickname === trimmed
        ? check.status
        : 'checking'
  const isAvailable = status === 'available'

  const handleSubmit = () => {
    if (!isAvailable || sending) return
    setSending(true)
    registerNickname(trimmed)
      .then(({ nickname: saved }) =>
        // 안내 화면에서 "○○ 님의"로 부르기 위해 닉네임을 같이 넘긴다
        navigate(ROUTES.levelTestIntro, { replace: true, state: { nickname: saved } }),
      )
      .catch((e: unknown) => {
        setCheck(toCheck(trimmed, e))
        setSending(false)
      })
  }

  return (
    <>
      {/* 뒤로 가면 카카오 인가 페이지로 돌아가므로, 약관 화면으로 바로 보낸다 */}
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => navigate(ROUTES.terms, { replace: true })}
        className="flex h-10 w-10 items-center text-herb"
      >
        <BackIcon className="w-[19px]" />
      </button>

      {/* 다람쥐 캐릭터 (원래 자리 높이 142에 맞춰 폭 124 → 높이 142) */}
      <div className="mt-[18px] flex justify-center">
        <Character width={124} />
      </div>

      <h1 className="mt-4 text-center text-question">
        반가워요!
        <br />
        뭐라고 불러드릴까요?
      </h1>

      <label className="mt-3 flex h-[60px] items-center gap-2 rounded-btn border-2 border-herb-500 bg-coconut-100 px-gutter">
        <span className="sr-only">닉네임</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="닉네임을 입력해 주세요"
          className="min-w-0 flex-1 bg-transparent text-card-title text-burnt-orange-500 outline-none placeholder:font-medium placeholder:text-herb-300"
        />
        <span className="text-sub text-apricot-500">
          {nickname.length}/{MAX_LENGTH}
        </span>
      </label>

      {status && (
        <p
          role={status === 'checking' ? 'status' : 'alert'}
          className={clsx('mt-gap text-sub', CHECK_TEXT[status].className)}
        >
          {status === 'error' && check?.message ? check.message : CHECK_TEXT[status].text}
        </p>
      )}

      <Button
        className="mt-auto enabled:bg-avocado-500 enabled:shadow-[0_4px_0_var(--color-avocado-700)]"
        disabled={!isAvailable || sending}
        onClick={handleSubmit}
      >
        {sending ? '저장하고 있어요' : '다음'}
      </Button>
    </>
  )
}
