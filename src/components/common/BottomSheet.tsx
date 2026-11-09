/**
 * 바텀시트: 화면을 herb-900 45%로 어둡게 하고 아래에서 올라오는 시트
 * - 바깥(딤)을 누르거나 Esc를 누르면 onClose
 */
import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  labelledBy?: string
  children: ReactNode
}

export default function BottomSheet({ open, onClose, labelledBy, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex max-w-app flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-herb-900/45"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative flex flex-col gap-3 rounded-t-[24px] bg-coconut-100 px-gutter pt-3 pb-[calc(var(--spacing-gutter)+env(safe-area-inset-bottom))]"
      >
        <span aria-hidden className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-coconut-600" />
        {children}
      </section>
    </div>
  )
}
