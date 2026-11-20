/**
 * 바텀시트 (Figma '바텀시트': coconut-100, 위 모서리 60, 패딩 40/50, 간격 30, 손잡이 120×12)
 * - 화면을 herb-900 45%로 어둡게 하고 아래에서 올라온다.
 * - 바깥(딤)을 누르거나 Esc를 누르면 onClose
 * - peek: 시트 윗변에 손 올린 다람쥐를 보여 준다
 */
import { useEffect, type ReactNode } from 'react'

import PeekSquirrel from './PeekSquirrel'

type Props = {
  open: boolean
  onClose: () => void
  labelledBy?: string
  peek?: boolean
  children: ReactNode
}

export default function BottomSheet({ open, onClose, labelledBy, peek = false, children }: Props) {
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
        className="relative flex flex-col gap-3 rounded-t-[24px] bg-coconut-100 px-gutter pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-card"
      >
        {peek && <PeekSquirrel right={28} />}
        <span aria-hidden className="mx-auto h-[4.8px] w-12 rounded-full bg-coconut-600" />
        {children}
      </section>
    </div>
  )
}
