/**
 * 버튼 (모서리 16 = Figma rx 40, 그라데이션·테두리 없음)
 * 모든 버튼: 바깥 그림자 y4(Figma y10) · 흐림 0 · 버튼 색보다 200 진한 색
 *
 * - primary  : 하나로 통일. apricot-600 + apricot-800 그림자, 350×52 (Figma 875×130, w-btn-width · h-btn)
 * - secondary: 섹터별 색. 섹터 100 바탕 + 700 글자 + 300 그림자 (sector 없으면 apricot)
 * - disabled : coconut-600 + coconut-800 그림자
 */
import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

import type { Sector } from '@/constants/sectors'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  /** 보조 버튼에만 적용되는 섹터 색. 없으면 apricot */
  sector?: Sector
}

const SECONDARY_CLASS: Record<Sector, string> = {
  stock: 'w-full bg-apricot-100 text-apricot-700 shadow-[0_4px_0_var(--color-apricot-300)]',
  life: 'w-full bg-avocado-100 text-avocado-700 shadow-[0_4px_0_var(--color-avocado-300)]',
  basic:
    'w-full bg-burnt-orange-100 text-burnt-orange-700 shadow-[0_4px_0_var(--color-burnt-orange-300)]',
}

export default function Button({
  variant = 'primary',
  sector,
  disabled,
  className,
  type = 'button',
  ...rest
}: Props) {
  const colorClass = disabled
    ? 'w-full cursor-not-allowed bg-coconut-600 text-coconut-100 shadow-[0_4px_0_var(--color-coconut-800)]'
    : variant === 'primary'
      ? 'w-btn-width bg-apricot-600 text-coconut-100 shadow-[0_4px_0_var(--color-apricot-800)]'
      : SECONDARY_CLASS[sector ?? 'stock']

  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(
        'rounded-btn h-btn max-w-full px-gutter text-card-title transition-[transform,box-shadow] duration-75',
        // 누르면 그림자만큼 내려가며 눌린 느낌
        'enabled:active:translate-y-1 enabled:active:shadow-none',
        colorClass,
        className,
      )}
      {...rest}
    />
  )
}
