/** 문제 풀이·레벨 테스트 상단: ✕ 닫기 + 진행 바 + n/전체 */
import ProgressBar from './ProgressBar'

type Props = {
  value: number
  max: number
  label?: string
  onClose: () => void
}

export default function QuizTopBar({ value, max, label, onClose }: Props) {
  return (
    <div className="flex h-12 items-center gap-3">
      <button
        type="button"
        aria-label="학습 그만두기"
        onClick={onClose}
        className="-ml-1 flex size-9 items-center justify-center rounded-full text-xl text-coconut-800"
      >
        ✕
      </button>
      <ProgressBar value={value} max={max} className="flex-1" />
      <span className="min-w-10 text-right text-sub text-coconut-800">
        {label ?? `${value}/${max}`}
      </span>
    </div>
  )
}
