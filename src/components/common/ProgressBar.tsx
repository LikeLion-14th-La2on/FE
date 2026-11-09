/** 진행 바: 채움 apricot-500, 바탕 apricot-200 */
type Props = {
  value: number
  max: number
  className?: string
}

export default function ProgressBar({ value, max, className }: Props) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`h-2 w-full overflow-hidden rounded-full bg-apricot-200 ${className ?? ''}`}
    >
      <div
        className="h-full rounded-full bg-apricot-500 transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
