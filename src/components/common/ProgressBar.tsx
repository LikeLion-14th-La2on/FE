/** 진행 바: 기본 채움 apricot-500, 바탕 apricot-200 (섹터별 색은 trackClass · fillClass로 바꾼다) */
type Props = {
  value: number
  max: number
  className?: string
  trackClass?: string
  fillClass?: string
}

export default function ProgressBar({
  value,
  max,
  className,
  trackClass = 'bg-apricot-200',
  fillClass = 'bg-apricot-500',
}: Props) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`h-2 w-full overflow-hidden rounded-full ${trackClass} ${className ?? ''}`}
    >
      <div
        className={`h-full rounded-full transition-[width] ${fillClass}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
