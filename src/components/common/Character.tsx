/** 다람쥐 캐릭터 자리 (캐릭터 디자인이 나오면 이미지로 교체) */
import clsx from 'clsx'

export default function Character({
  size = 120,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label="다람쥐 캐릭터"
      style={{ width: size, height: size }}
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-avocado-300 bg-avocado-100 text-center text-tag text-avocado-500',
        className,
      )}
    >
      다람쥐
      <br />
      캐릭터
    </div>
  )
}
