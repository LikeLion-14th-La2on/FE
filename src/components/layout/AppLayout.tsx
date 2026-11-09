/** 하단 바가 있는 화면 틀 (홈 · 뉴스 · 오답노트 · 금융도구 · 마이) */
import { Outlet } from 'react-router'

import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-app bg-coconut-200">
      <main className="px-gutter pt-gutter pb-[calc(var(--spacing-nav)+var(--spacing-nav-inset)*2+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
