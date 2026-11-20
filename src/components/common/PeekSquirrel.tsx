/**
 * 카드 위에 손을 올린 다람쥐 (Figma '카드에 손 올린 다람쥐')
 * 카드(relative) 안에 넣으면 카드 윗변 오른쪽에 걸쳐 보인다.
 * - right: 카드 오른쪽 끝에서 다람쥐 오른쪽 끝까지 거리(px)
 * - small: 레벨 테스트처럼 작은 크기(0.75배)
 */
import clsx from 'clsx'

import peek from '@/assets/squirrel-peek.webp'

export default function PeekSquirrel({
  right = 28,
  small = false,
  className,
}: {
  right?: number
  small?: boolean
  className?: string
}) {
  const s = small ? 0.75 : 1
  return (
    <span
      aria-hidden
      className={clsx('pointer-events-none absolute bottom-full overflow-hidden', className)}
      style={{ right, width: 66.8 * s, height: 80.4 * s, marginBottom: -3.2 * s }}
    >
      <img
        src={peek}
        alt=""
        className="absolute max-w-none"
        style={{ left: -14.4 * s, top: -3.2 * s, width: 90.4 * s }}
        draggable={false}
      />
    </span>
  )
}
