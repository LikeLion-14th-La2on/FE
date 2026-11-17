/** 닉네임 설정: 닉네임(최대 10자)을 입력하면 레벨 테스트로 이동 */
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/common'
import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

const MAX_LENGTH = 10

export default function NicknamePage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const trimmed = nickname.trim()
  // TODO: 닉네임 중복 확인 API 연결 후 결과로 교체 (지금은 빈칸만 아니면 사용 가능으로 표시)
  const isAvailable = trimmed.length > 0 && trimmed.length <= MAX_LENGTH

  const handleSubmit = () => {
    // TODO: 닉네임 저장 API 연결 후 이동
    navigate(ROUTES.levelTest, { replace: true })
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

      {/* 다람쥐 캐릭터 자리 (이미지 준비되면 넣기) */}
      <div className="mx-auto mt-[18px] size-[142px]" aria-hidden />

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

      {isAvailable && (
        <p className="mt-gap text-sub text-avocado-500">✓ 사용 가능한 닉네임이에요</p>
      )}

      <Button
        className="mt-auto enabled:bg-avocado-500 enabled:shadow-[0_4px_0_var(--color-avocado-700)]"
        disabled={!isAvailable}
        onClick={handleSubmit}
      >
        다음
      </Button>
    </>
  )
}
