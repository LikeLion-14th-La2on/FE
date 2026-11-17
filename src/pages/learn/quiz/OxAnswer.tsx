/**
 * OX 답: 큰 버튼 2개. 제출 후엔 정답/오답 표시
 * - 고른 버튼은 테두리 대신 눌린 채(아래로 내려가고 그림자 없음)로 남는다 (버튼 공통 스펙과 같은 눌림)
 */
import clsx from 'clsx'

type Props = {
  value: 'O' | 'X' | null
  answer: 'O' | 'X'
  submitted: boolean
  onSelect: (v: 'O' | 'X') => void
}

export default function OxAnswer({ value, answer, submitted, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
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
              'flex h-28 items-center justify-center rounded-card text-[44px] font-black text-coconut-100',
              'transition-[transform,box-shadow,opacity] duration-75 enabled:active:translate-y-1 enabled:active:shadow-none',
              v === 'O'
                ? 'bg-avocado-500 shadow-[0_5px_0_var(--color-avocado-700)]'
                : 'bg-burnt-orange-500 shadow-[0_5px_0_var(--color-burnt-orange-700)]',
              picked && 'translate-y-1 shadow-none',
              dim && 'opacity-40',
            )}
          >
            {v}
            {submitted && v === answer && <span className="ml-2 text-xl">✓</span>}
          </button>
        )
      })}
    </div>
  )
}
