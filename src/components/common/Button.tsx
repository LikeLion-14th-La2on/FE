/**
 * 버튼
 * - primary  : apricot-600 + 아래 입체 그림자 apricot-700
 * - secondary: apricot-100 + apricot-700 글자 + apricot-300 입체 (흰 버튼은 쓰지 않음)
 * - disabled : coconut-600
 */
import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  fullWidth = true,
  disabled,
  className,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(
        'h-btn rounded-card px-gutter text-card-title transition-[transform,box-shadow] duration-75',
        'enabled:active:translate-y-1 enabled:active:shadow-none',
        fullWidth && 'w-full',
        disabled
          ? 'cursor-not-allowed bg-coconut-600 text-coconut-100'
          : variant === 'primary'
            ? 'bg-apricot-600 text-coconut-100 shadow-btn-primary'
            : 'bg-apricot-100 text-apricot-700 shadow-btn-secondary',
        className,
      )}
      {...rest}
    />
  )
}
