/** 카드: coconut-100 + coconut-600 그림자, 테두리 없음 */
import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

export default function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-card bg-coconut-100 p-gutter shadow-card', className)}
      {...rest}
    />
  )
}
