/** 4지선다·상황형 답 */
import { CIRCLED } from './answer'
import QuizOption, { type QuizOptionState } from './QuizOption'

type Props = {
  options: string[]
  value: number | null
  answer: number
  submitted: boolean
  onSelect: (i: number) => void
}

export default function ChoiceAnswer({ options, value, answer, submitted, onSelect }: Props) {
  const stateOf = (i: number): QuizOptionState => {
    if (!submitted) return value === i ? 'selected' : 'default'
    if (i === answer) return 'correct'
    if (i === value) return 'wrong'
    return 'default'
  }

  return (
    <div className="flex flex-col gap-gap">
      {options.map((opt, i) => (
        <QuizOption key={opt} state={stateOf(i)} disabled={submitted} onClick={() => onSelect(i)}>
          {`${CIRCLED[i]}  ${opt}`}
        </QuizOption>
      ))}
    </div>
  )
}
