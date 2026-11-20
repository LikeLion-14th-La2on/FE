/** 화면 상단: ← 뒤로가기 + 제목 (Figma '헤더': 높이 120, ← 50 Medium, 제목 42.5 Bold) */
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

type Props = {
  title?: string
  onBack?: () => void
  right?: ReactNode
}

export default function PageHeader({ title, onBack, right }: Props) {
  const navigate = useNavigate()
  return (
    <header className="flex h-12 shrink-0 items-center gap-3">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={onBack ?? (() => navigate(-1))}
        className="flex h-6 w-5 items-center justify-center text-[20px] leading-[1.4] font-medium text-herb"
      >
        ←
      </button>
      {title && <h1 className="text-[17px] leading-[1.4] font-bold text-herb">{title}</h1>}
      {right && <div className="ml-auto">{right}</div>}
    </header>
  )
}
