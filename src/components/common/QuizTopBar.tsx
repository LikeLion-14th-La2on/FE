/** 문제 풀이·레벨 테스트 상단: ✕ 닫기 + 진행 바 + n/전체 (Figma 높이 70, ✕ 50 Black, 바 25, 숫자 32.5 Bold) */
import ProgressBar from './ProgressBar'

type Props = {
  value: number
  max: number
  label?: string
  onClose: () => void
}

export default function QuizTopBar({ value, max, label, onClose }: Props) {
  return (
    <div className="flex h-7 shrink-0 items-center gap-3">
      <button
        type="button"
        aria-label="그만두기"
        onClick={onClose}
        className="flex h-7 w-[18px] items-center justify-center text-[20px] leading-[1.4] font-black text-avocado-400"
      >
        ✕
      </button>
      <ProgressBar value={value} max={max} className="h-2.5! flex-1" />
      <span className="text-right text-[13px] leading-[1.4] font-bold text-avocado-400">
        {label ?? `${value}/${max}`}
      </span>
    </div>
  )
}
