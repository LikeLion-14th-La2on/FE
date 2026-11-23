/**
 * 3D 다람쥐 캐릭터 (Figma '캐릭터(3D 다람쥐)')
 * - 전신 이미지 + 아래 바닥 그림자(coconut-600 타원, 흐림)
 * - width: 이미지 폭(px). Figma 수치 ÷ 2.5 (결과 343 → 137, 단계 완수 428 → 171, 빈 상태 240 → 96)
 */
import clsx from 'clsx'

import squirrel from '@/assets/squirrel.webp'

export default function Character({
  width = 137,
  className,
}: {
  width?: number
  className?: string
}) {
  return (
    <div className={clsx('relative shrink-0', className)} style={{ width, height: width * 1.146 }}>
      <span
        aria-hidden
        className="absolute rounded-[50%] bg-coconut-600 blur-[6px]"
        style={{ left: width * 0.12, bottom: 0, width: width * 0.62, height: width * 0.088 }}
      />
      <img
        src={squirrel}
        alt="다람쥐 캐릭터"
        className="relative h-auto max-w-none"
        style={{ width }}
        draggable={false}
      />
    </div>
  )
}
