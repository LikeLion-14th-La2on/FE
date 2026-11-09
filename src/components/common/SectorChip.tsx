/**
 * 섹터 칩: 📈 주식 apricot · 🏠 생활 금융 avocado · 📘 금융 기초 burnt-orange
 * 바탕은 /200 (금융 기초만 /100), 모서리 끝까지 둥글게
 */
import clsx from 'clsx'

import { SECTORS, type Sector } from '@/constants/sectors'

export default function SectorChip({ sector, className }: { sector: Sector; className?: string }) {
  const { label, emoji, chipClass } = SECTORS[sector]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-tag text-herb',
        chipClass,
        className,
      )}
    >
      <span aria-hidden>{emoji}</span>
      {label}
    </span>
  )
}
