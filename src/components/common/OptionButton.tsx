/**
 * 퀴즈 보기
 * - default : coconut-100 + coconut-600 입체(y3.2)
 * - selected: apricot-100 + apricot-500 테두리
 * - correct : avocado-100 + avocado-500 테두리 ✓
 * - wrong   : burnt-orange-100 + burnt-orange-500 테두리 ✕
 */
import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

export type OptionState = 'default' | 'selected' | 'correct' | 'wrong'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: OptionState
}

const STATE_CLASS: Record<OptionState, string> = {
  default: 'border-transparent bg-coconut-100 shadow-option',
  selected: 'border-apricot-500 bg-apricot-100',
  correct: 'border-avocado-500 bg-avocado-100',
  wrong: 'border-burnt-orange-500 bg-burnt-orange-100',
}

export default function OptionButton({
  state = 'default',
  className,
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      aria-pressed={state === 'selected'}
      className={clsx(
        'flex w-full items-center justify-between gap-2 rounded-option border-2 px-gutter py-4 text-left text-body font-medium',
        STATE_CLASS[state],
        className,
      )}
      {...rest}
    >
      <span>{children}</span>
      {state === 'correct' && (
        <span className="text-avocado-500" aria-label="정답">
          ✓
        </span>
      )}
      {state === 'wrong' && (
        <span className="text-burnt-orange-500" aria-label="오답">
          ✕
        </span>
      )}
    </button>
  )
}
