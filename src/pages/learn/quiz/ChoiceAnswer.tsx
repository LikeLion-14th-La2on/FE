/** 4지선다·상황형 답 */
import { OptionButton, type OptionState } from '@/components/common'

import { CIRCLED } from './answer'

type Props = {
  options: string[]
  value: number | null
  answer: number
  submitted: boolean
  onSelect: (i: number) => void
}

export default function ChoiceAnswer({ options, value, answer, submitted, onSelect }: Props) {
  const stateOf = (i: number): OptionState => {
    if (!submitted) return value === i ? 'selected' : 'default'
    if (i === answer) return 'correct'
    if (i === value) return 'wrong'
    return 'default'
  }

  return (
    <div className="flex flex-col gap-3">
      {options.map((opt, i) => (
        <OptionButton
          key={opt}
          state={stateOf(i)}
          disabled={submitted}
          onClick={() => onSelect(i)}
          className={value === i || (submitted && i === answer) ? 'font-bold' : undefined}
        >
          {CIRCLED[i]}&nbsp;&nbsp;{opt}
        </OptionButton>
      ))}
    </div>
  )
}
