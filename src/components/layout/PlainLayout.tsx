/** 하단 바가 없는 화면 틀 (온보딩 · 학습 진행 · 상세 화면) */
import { Outlet } from 'react-router'

export default function PlainLayout() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-app bg-coconut-200">
      <main className="flex min-h-dvh flex-col px-gutter pt-gutter pb-[calc(var(--spacing-gutter)+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  )
}
