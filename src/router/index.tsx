import { createBrowserRouter } from 'react-router'

import AppLayout from '@/components/layout/AppLayout'
import PlainLayout from '@/components/layout/PlainLayout'
import GlossaryPage from '@/pages/glossary/GlossaryPage'
import TermDetailPage from '@/pages/glossary/TermDetailPage'
import HomePage from '@/pages/home/HomePage'
import QuizPage from '@/pages/learn/QuizPage'
import SectorStagePage from '@/pages/learn/SectorStagePage'
import StageCompletePage from '@/pages/learn/StageCompletePage'
import TermPreviewPage from '@/pages/learn/TermPreviewPage'
import CharacterShopPage from '@/pages/my/CharacterShopPage'
import MyPage from '@/pages/my/MyPage'
import NewsPage from '@/pages/news/NewsPage'
import LevelTestPage from '@/pages/onboarding/LevelTestPage'
import LevelTestResultPage from '@/pages/onboarding/LevelTestResultPage'
import LoginPage from '@/pages/onboarding/LoginPage'
import NicknamePage from '@/pages/onboarding/NicknamePage'
import TermsPage from '@/pages/onboarding/TermsPage'
import CardNewsReviewPage from '@/pages/review/CardNewsReviewPage'
import CompoundInterestPage from '@/pages/tools/CompoundInterestPage'
import LoanRepaymentPage from '@/pages/tools/LoanRepaymentPage'
import RateSimulatorPage from '@/pages/tools/RateSimulatorPage'
import ToolsPage from '@/pages/tools/ToolsPage'
import AiTutorPage from '@/pages/tutor/AiTutorPage'
import WrongNotePage from '@/pages/wrong-note/WrongNotePage'

import { ROUTE_PATTERNS, ROUTES } from './routes'

export const router = createBrowserRouter([
  // 하단 바 있는 화면
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.news, element: <NewsPage /> },
      { path: ROUTES.wrongNote, element: <WrongNotePage /> },
      { path: ROUTES.tools, element: <ToolsPage /> },
      { path: ROUTES.my, element: <MyPage /> },
    ],
  },
  // 하단 바 없는 화면
  {
    element: <PlainLayout />,
    children: [
      // ① 온보딩 · 레벨 테스트
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.terms, element: <TermsPage /> },
      { path: ROUTES.nickname, element: <NicknamePage /> },
      { path: ROUTES.levelTest, element: <LevelTestPage /> },
      { path: ROUTES.levelTestResult, element: <LevelTestResultPage /> },

      // ② 학습
      { path: ROUTES.learn, element: <SectorStagePage /> },
      { path: ROUTE_PATTERNS.termPreview, element: <TermPreviewPage /> },
      { path: ROUTE_PATTERNS.quiz, element: <QuizPage /> },
      { path: ROUTE_PATTERNS.stageComplete, element: <StageCompletePage /> },

      // ③ 복습 · 금융 도구 상세 · AI 튜터 · 상점
      { path: ROUTES.cardNewsReview, element: <CardNewsReviewPage /> },
      { path: ROUTES.loanRepayment, element: <LoanRepaymentPage /> },
      { path: ROUTES.compoundInterest, element: <CompoundInterestPage /> },
      { path: ROUTES.rateSimulator, element: <RateSimulatorPage /> },
      { path: ROUTE_PATTERNS.aiTutor, element: <AiTutorPage /> },
      { path: ROUTES.glossary, element: <GlossaryPage /> },
      { path: ROUTE_PATTERNS.glossaryTerm, element: <TermDetailPage /> },
      { path: ROUTES.characterShop, element: <CharacterShopPage /> },
    ],
  },
])
