import type { Sector } from '@/constants/sectors'

/** 경로는 여기서만 정의하고, 페이지에서는 ROUTES로 이동한다. */
export const ROUTES = {
  // ① 온보딩 · 레벨 테스트
  login: '/login',
  kakaoCallback: '/oauth/kakao', // 카카오 디벨로퍼스에 등록한 Redirect URI 경로와 같아야 한다
  terms: '/onboarding/terms',
  nickname: '/onboarding/nickname',
  levelTest: '/level-test',
  levelTestResult: '/level-test/result',

  // ② 홈 · 학습
  home: '/',
  learn: '/learn',
  termPreview: (sector: Sector, stage: number) => `/learn/${sector}/${stage}/preview`,
  quiz: (sector: Sector, stage: number) => `/learn/${sector}/${stage}/quiz`,
  stageComplete: (sector: Sector, stage: number) => `/learn/${sector}/${stage}/complete`,

  // ③ 복습 · 오답노트 · 금융 도구 · 마이페이지
  cardNewsReview: '/review',
  news: '/news',
  wrongNote: '/wrong-note',
  tools: '/tools',
  loanRepayment: '/tools/loan-repayment',
  compoundInterest: '/tools/compound-interest',
  rateSimulator: '/tools/rate-simulator',
  aiTutor: (termId: string) => `/tutor/${termId}`,
  glossary: '/glossary',
  glossaryTerm: (termId: string) => `/glossary/${termId}`,
  my: '/my',
  characterShop: '/my/shop',
} as const

/** 라우터 등록용 패턴 (:param) */
export const ROUTE_PATTERNS = {
  termPreview: '/learn/:sector/:stage/preview',
  quiz: '/learn/:sector/:stage/quiz',
  stageComplete: '/learn/:sector/:stage/complete',
  aiTutor: '/tutor/:termId',
  glossaryTerm: '/glossary/:termId',
} as const
