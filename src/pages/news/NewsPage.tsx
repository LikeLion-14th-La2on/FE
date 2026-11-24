/** 뉴스 탭: 지금은 오늘의 시사 퀴즈만 (뉴스 콘텐츠는 아직 정해지지 않음) */
import { useNavigate } from 'react-router'

import BackIcon from '@/components/icons/BackIcon'
import { ROUTES } from '@/router/routes'

import NewsQuizCard from './NewsQuizCard'

export default function NewsPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col">
      <header className="flex items-center">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.home)}
          className="flex h-10 w-8 items-center text-herb"
        >
          <BackIcon className="w-[19px]" />
        </button>
        <h1 className="text-[18px] font-bold text-herb">뉴스</h1>
      </header>

      <p className="mt-[18px] text-[16px] leading-[1.4] font-medium text-avocado-500">
        이번 주 뉴스로 금융 감각을 확인해 봐요
      </p>

      <div className="mt-3">
        <NewsQuizCard />
      </div>
    </div>
  )
}
