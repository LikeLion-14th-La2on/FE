/** 화면 상단: ← 뒤로가기 + 제목 (Figma '헤더' 컴포넌트) */
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
    <header className="flex h-12 items-center gap-3">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={onBack ?? (() => navigate(-1))}
        className="-ml-1 flex size-9 items-center justify-center rounded-full text-xl text-herb"
      >
        ←
      </button>
      {title && <h1 className="text-card-title text-herb">{title}</h1>}
      {right && <div className="ml-auto">{right}</div>}
    </header>
  )
}
