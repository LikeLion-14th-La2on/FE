/**
 * 문제 보기 (Figma 문제 풀이 '영역' 875×127)
 * - default : coconut-100 + 카드 그림자, 15 Medium herb
 * - selected: apricot-100 + apricot-500 테두리, 15 Bold apricot-800
 * - correct : avocado-100 + avocado-500 테두리, 15 Medium herb + ✓
 * - wrong   : burnt-orange-100 + burnt-orange-500 테두리, 15 Bold burnt-orange-700 + ✕
 */
import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

export type QuizOptionState = 'default' | 'selected' | 'correct' | 'wrong'

const STATE_CLASS: Record<QuizOptionState, string> = {
  default: 'border-transparent bg-coconut-100 font-medium text-herb shadow-card',
  selected: 'border-apricot-500 bg-apricot-100 font-bold text-apricot-800',
  correct: 'border-avocado-500 bg-avocado-100 font-medium text-herb',
  wrong: 'border-burnt-orange-500 bg-burnt-orange-100 font-bold text-burnt-orange-700',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { state?: QuizOptionState }

export default function QuizOption({ state = 'default', children, className, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={state === 'selected'}
      className={clsx(
        'flex w-full items-center rounded-[24px] border-2 px-4 py-[13px] text-left text-[15px] leading-[1.4] whitespace-pre-wrap',
        STATE_CLASS[state],
        className,
      )}
      {...rest}
    >
      {children}
      {state === 'correct' && <span aria-label="정답">{'   ✓'}</span>}
      {state === 'wrong' && <span aria-label="오답">{'   ✕'}</span>}
    </button>
  )
}
