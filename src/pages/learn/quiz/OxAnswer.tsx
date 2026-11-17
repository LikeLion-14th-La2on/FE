/**
 * OX 답: 큰 버튼 2개 (Figma 423×240, 모서리 60, 글자 100 Black)
 * - 버튼 공통 스펙처럼 아래 그림자(버튼 색 +200)가 있고, 누르면 아래로 내려간다.
 * - 고른 버튼은 눌린 채로 남는다 (테두리 표시 없음).
 * - 제출 후: 정답 쪽에 ✓, 고르지 않은 오답 쪽은 흐리게.
 */
import clsx from 'clsx'

import { OX_CLASS } from './answer'

type Props = {
  value: 'O' | 'X' | null
  answer?: 'O' | 'X'
  submitted?: boolean
  onSelect: (v: 'O' | 'X') => void
}

export default function OxAnswer({ value, answer, submitted = false, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 pb-1">
      {(['O', 'X'] as const).map((v) => {
        const picked = value === v
        const dim = submitted && v !== answer && !picked
        return (
          <button
            key={v}
            type="button"
            disabled={submitted}
            aria-pressed={picked}
            onClick={() => onSelect(v)}
            className={clsx(
              'flex h-24 items-center justify-center rounded-[24px] text-[40px] leading-[1.4] font-black text-coconut-500',
              'transition-[transform,box-shadow,opacity] duration-75 enabled:active:translate-y-1 enabled:active:shadow-none',
              OX_CLASS[v],
              picked && 'translate-y-1 shadow-none',
              dim && 'opacity-40',
            )}
          >
            {v}
            {submitted && v === answer && <span className="ml-2 text-[20px]">✓</span>}
          </button>
        )
      })}
    </div>
  )
}
