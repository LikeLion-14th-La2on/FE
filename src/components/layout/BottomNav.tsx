/**
 * 하단 바 (플로팅)
 * - 화면 아래·좌우 16px 띄운 알약형 (높이 76, 모서리 38)
 * - 선택된 탭: apricot-600 원(56)으로 표시, 이름은 숨김
 * - 탭 5개 구성은 TABS 배열에서 관리
 */
import type { ComponentType, SVGProps } from 'react'
import { NavLink } from 'react-router'

import {
  BookIcon,
  CalculatorIcon,
  HomeIcon,
  NewsIcon,
  PersonIcon,
} from '@/components/icons/NavIcons'
import { ROUTES } from '@/router/routes'

type Tab = {
  to: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const TABS: Tab[] = [
  { to: ROUTES.home, label: '홈', Icon: HomeIcon },
  { to: ROUTES.news, label: '뉴스', Icon: NewsIcon },
  { to: ROUTES.wrongNote, label: '오답노트', Icon: BookIcon },
  { to: ROUTES.tools, label: '금융도구', Icon: CalculatorIcon },
  { to: ROUTES.my, label: '마이', Icon: PersonIcon },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-[calc(var(--spacing-nav-inset)+env(safe-area-inset-bottom))] z-50 mx-auto w-full max-w-app px-nav-inset"
    >
      <ul className="grid h-nav grid-cols-5 items-center rounded-full border border-coconut-400 bg-coconut-100 px-[9px] shadow-nav">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to} className="flex justify-center">
            <NavLink
              to={to}
              end={to === ROUTES.home}
              aria-label={label}
              className="flex size-nav-active items-center justify-center rounded-full"
            >
              {({ isActive }) =>
                isActive ? (
                  <span className="flex size-nav-active items-center justify-center rounded-full bg-apricot-600 text-coconut-100 shadow-nav-active">
                    <Icon className="size-nav-icon" strokeWidth={5.17} />
                  </span>
                ) : (
                  <span className="flex flex-col items-center gap-1 text-coconut-800">
                    <Icon className="size-nav-icon" />
                    <span className="text-tag leading-none">{label}</span>
                  </span>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
