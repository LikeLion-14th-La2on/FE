/**
 * 하단 바 (플로팅)
 * - 화면 아래·좌우 16px 띄운 알약형 (높이 76, 모서리 38)
 * - 선택된 탭: apricot-600 원(56)으로 표시, 이름은 숨김
 * - 탭을 바꾸면 원이 새 탭 자리로 미끄러져 간다
 * - 탭 5개 구성은 TABS 배열에서 관리
 */
import clsx from 'clsx'
import type { ComponentType, SVGProps } from 'react'
import { NavLink, useLocation } from 'react-router'

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

/** NavLink의 활성 판단과 같은 규칙: 홈은 정확히 일치, 나머지는 하위 경로까지 포함 */
function isTabActive(to: string, pathname: string) {
  if (to === ROUTES.home) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

/** 원과 아이콘 색이 같은 시간에 바뀌도록 공통으로 쓰는 전환 */
const SLIDE = 'duration-300 ease-out motion-reduce:transition-none'

export default function BottomNav() {
  const { pathname } = useLocation()
  const activeIndex = TABS.findIndex(({ to }) => isTabActive(to, pathname))

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-[calc(var(--spacing-nav-inset)+env(safe-area-inset-bottom))] z-50 mx-auto w-full max-w-app px-nav-inset"
    >
      <div className="relative h-nav rounded-full border border-coconut-400 bg-coconut-100 px-[9px] shadow-nav">
        {/*
          선택 원: 탭 한 칸(전체의 1/5) 너비 상자를 칸 번호만큼 translateX로 옮긴다.
          translateX(100%)는 '자기 너비만큼'이라 칸 하나씩 정확히 이동한다.
        */}
        {activeIndex >= 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-[9px] left-[9px]"
          >
            <div
              className={clsx(
                'flex h-full w-1/5 items-center justify-center transition-transform',
                SLIDE,
              )}
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            >
              <span className="size-nav-active rounded-full bg-apricot-600 shadow-nav-active" />
            </div>
          </div>
        )}

        <ul className="relative grid h-full grid-cols-5 items-center">
          {TABS.map(({ to, label, Icon }) => (
            <li key={to} className="flex justify-center">
              <NavLink
                to={to}
                end={to === ROUTES.home}
                aria-label={label}
                className="flex size-nav-active items-center justify-center rounded-full"
              >
                {({ isActive }) => (
                  <span
                    className={clsx(
                      'flex flex-col items-center transition-colors',
                      SLIDE,
                      isActive ? 'text-coconut-100' : 'text-coconut-800',
                    )}
                  >
                    <Icon className="size-nav-icon" strokeWidth={isActive ? 5.17 : 4.83} />
                    {/* 선택되면 이름이 접히면서 아이콘이 원 가운데로 내려온다 */}
                    <span
                      className={clsx(
                        'overflow-hidden text-tag leading-none transition-all',
                        SLIDE,
                        isActive ? 'mt-0 max-h-0 opacity-0' : 'mt-1 max-h-4 opacity-100',
                      )}
                    >
                      {label}
                    </span>
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
