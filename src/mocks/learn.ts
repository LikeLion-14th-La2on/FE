/**
 * 학습 목업 데이터 (백엔드 API 연동 전까지 사용)
 * - 용어(Term), 퀴즈 문제(QuizQuestion), 단계별 학습 구성(getStageContent)
 * - API가 붙으면 이 파일을 쓰는 곳만 fetch 함수로 바꾸면 된다.
 */
import type { Sector } from '@/constants/sectors'

export const STAGE_COUNT = 3
export const SOURCE = '한국은행 경제금융용어 700선'

export type Term = {
  id: string
  name: string
  sector: Sector
  meaning: string
  example: string
  related: string[]
}

type QuestionBase = { id: string; termId: string; explanation: string }

export type OxQuestion = QuestionBase & { type: 'ox'; prompt: string; answer: 'O' | 'X' }
export type ChoiceQuestion = QuestionBase & {
  type: 'choice'
  prompt: string
  options: string[]
  answer: number
}
export type SituationQuestion = QuestionBase & {
  type: 'situation'
  situation: string
  prompt: string
  options: string[]
  answer: number
}
export type MatchingQuestion = QuestionBase & {
  type: 'matching'
  prompt: string
  pairs: { term: string; meaning: string }[]
}

export type QuizQuestion = OxQuestion | ChoiceQuestion | SituationQuestion | MatchingQuestion

export const TERMS: Record<string, Term> = {
  dividend: {
    id: 'dividend',
    name: '배당',
    sector: 'stock',
    meaning: '회사가 번 이익의 일부를 주주에게 나눠 주는 것',
    example: 'A회사 주식 10주를 가진 사람이 1주당 500원씩 배당을 받으면 5,000원을 받아요.',
    related: ['주주', '주식배당', '배당수익률'],
  },
  shareholder: {
    id: 'shareholder',
    name: '주주',
    sector: 'stock',
    meaning: '회사의 주식을 가지고 있는 사람',
    example: '주식을 1주만 사도 그 회사의 주주가 돼요.',
    related: ['배당', '주주총회'],
  },
  'short-selling': {
    id: 'short-selling',
    name: '공매도',
    sector: 'stock',
    meaning: '없는 주식을 빌려 먼저 팔고, 나중에 사서 갚는 거래',
    example: '주가가 내릴 거라고 보고 1만 원에 빌려 판 뒤 8천 원에 사서 갚으면 2천 원이 남아요.',
    related: ['주가', '대차거래'],
  },
  'jeonse-ratio': {
    id: 'jeonse-ratio',
    name: '전세가율',
    sector: 'life',
    meaning: '집값에서 전세보증금이 차지하는 비율',
    example: '집값이 3억 원이고 전세금이 2억 4천만 원이면 전세가율은 80%예요.',
    related: ['전세보증금', '깡통전세'],
  },
  'equal-payment': {
    id: 'equal-payment',
    name: '원리금균등상환',
    sector: 'life',
    meaning: '원금과 이자를 합쳐 매달 같은 금액으로 갚는 방식',
    example: '1,200만 원을 1년 동안 빌리면 매달 비슷한 금액을 갚아요.',
    related: ['원금균등상환', '만기일시상환'],
  },
  compound: {
    id: 'compound',
    name: '복리',
    sector: 'basic',
    meaning: '원금뿐 아니라 붙은 이자에도 이자가 붙는 방식',
    example: '100만 원을 연 5% 복리로 2년 두면 110만 2,500원이 돼요.',
    related: ['단리', '이자'],
  },
  'simple-interest': {
    id: 'simple-interest',
    name: '단리',
    sector: 'basic',
    meaning: '처음 맡긴 원금에만 이자가 붙는 방식',
    example: '100만 원을 연 5% 단리로 2년 두면 110만 원이 돼요.',
    related: ['복리', '이자'],
  },
}

export function getTerm(id: string | undefined): Term | undefined {
  return id ? TERMS[id] : undefined
}

/** 섹터별 오늘의 학습 (목업: 단계와 상관없이 같은 구성을 쓴다) */
const STAGE_CONTENT: Record<Sector, { termIds: string[]; questions: QuizQuestion[] }> = {
  stock: {
    termIds: ['dividend', 'shareholder', 'short-selling'],
    questions: [
      {
        id: 's1',
        type: 'choice',
        termId: 'dividend',
        prompt: '회사가 이익의 일부를\n주주에게 나눠 주는 것은?',
        options: ['이자', '배당', '액면가', '공매도'],
        answer: 1,
        explanation:
          '배당은 회사가 번 이익의 일부를 주주에게 돌려주는 것이에요. 현금 대신 주식으로 줄 수도 있어요.',
      },
      {
        id: 's2',
        type: 'ox',
        termId: 'dividend',
        prompt: '배당은 반드시\n현금으로만 준다?',
        answer: 'X',
        explanation: '배당은 현금 말고 주식으로도 줄 수 있어요. 이걸 주식배당이라고 해요.',
      },
      {
        id: 's3',
        type: 'matching',
        termId: 'shareholder',
        prompt: '용어와 뜻을\n짝지어 보세요',
        pairs: [
          { term: '배당', meaning: '이익을 주주에게 나눠 줌' },
          { term: '주주', meaning: '회사 주식을 가진 사람' },
          { term: '공매도', meaning: '없는 주식을 빌려 먼저 팖' },
          { term: '주가', meaning: '주식 1주의 가격' },
        ],
        explanation: '배당·주주·공매도·주가는 주식 뉴스에 가장 자주 나오는 용어예요.',
      },
      {
        id: 's4',
        type: 'situation',
        termId: 'short-selling',
        situation:
          '지훈이는 A회사 주가가 떨어질 거라고 보고, 주식을 빌려서 먼저 판 다음 나중에 싸게 사서 갚으려고 해요.',
        prompt: '이 상황에 맞는\n개념은?',
        options: ['배당', '공매도', '분산투자', '액면분할'],
        answer: 1,
        explanation: '없는 주식을 빌려 먼저 팔고 나중에 사서 갚는 거래를 공매도라고 해요.',
      },
      {
        id: 's5',
        type: 'ox',
        termId: 'shareholder',
        prompt: '주식을 1주만 사도\n그 회사의 주주가 된다?',
        answer: 'O',
        explanation: '1주라도 가지고 있으면 주주예요. 가진 주식 수만큼 배당을 받아요.',
      },
    ],
  },
  life: {
    termIds: ['jeonse-ratio', 'equal-payment'],
    questions: [
      {
        id: 'l1',
        type: 'choice',
        termId: 'jeonse-ratio',
        prompt: '집값에서 전세보증금이\n차지하는 비율은?',
        options: ['전세가율', '대출금리', '월세전환율', 'LTV'],
        answer: 0,
        explanation: '전세가율이 높을수록 집값이 떨어졌을 때 보증금을 돌려받기 어려워져요.',
      },
      {
        id: 'l2',
        type: 'ox',
        termId: 'equal-payment',
        prompt: '원리금균등상환은\n매달 갚는 금액이 같다?',
        answer: 'O',
        explanation: '원금과 이자를 합친 금액을 매달 똑같이 나눠 갚는 방식이에요.',
      },
      {
        id: 'l3',
        type: 'situation',
        termId: 'jeonse-ratio',
        situation: '수아가 보는 집은 집값 3억 원, 전세금 2억 7천만 원이에요.',
        prompt: '이 집의 전세가율은?',
        options: ['70%', '80%', '90%', '100%'],
        answer: 2,
        explanation: '2억 7천만 원 ÷ 3억 원 = 90%예요. 전세가율이 높아서 조심해야 하는 집이에요.',
      },
      {
        id: 'l4',
        type: 'matching',
        termId: 'equal-payment',
        prompt: '용어와 뜻을\n짝지어 보세요',
        pairs: [
          { term: '원리금균등', meaning: '매달 같은 금액을 갚음' },
          { term: '원금균등', meaning: '원금을 같은 금액씩 갚음' },
          { term: '만기일시', meaning: '마지막에 원금을 한 번에 갚음' },
          { term: '전세가율', meaning: '집값 대비 전세금 비율' },
        ],
        explanation: '상환 방식에 따라 매달 내는 돈과 전체 이자가 달라져요.',
      },
      {
        id: 'l5',
        type: 'ox',
        termId: 'jeonse-ratio',
        prompt: '전세가율이 높을수록\n보증금을 떼일 위험이 작다?',
        answer: 'X',
        explanation: '전세가율이 높으면 집값이 조금만 내려도 보증금을 돌려받기 어려워져요.',
      },
    ],
  },
  basic: {
    termIds: ['compound', 'simple-interest'],
    questions: [
      {
        id: 'b1',
        type: 'ox',
        termId: 'compound',
        prompt: '복리는 이자에도\n이자가 붙는다?',
        answer: 'O',
        explanation: '복리는 원금과 그동안 붙은 이자를 합친 금액에 다시 이자가 붙어요.',
      },
      {
        id: 'b2',
        type: 'choice',
        termId: 'simple-interest',
        prompt: '처음 맡긴 원금에만\n이자가 붙는 방식은?',
        options: ['복리', '단리', '변동금리', '고정금리'],
        answer: 1,
        explanation: '단리는 원금에만 이자가 붙어서 기간이 길어져도 이자가 일정해요.',
      },
      {
        id: 'b3',
        type: 'situation',
        termId: 'compound',
        situation:
          '민지는 매달 30만 원씩 적금을 넣고 있어요. 은행 직원이 "이자에도 이자가 붙는 상품이에요"라고 설명했어요.',
        prompt: '이 상황에 맞는\n개념은?',
        options: ['단리', '복리', '원리금균등', '배당'],
        answer: 1,
        explanation:
          '이자에도 이자가 붙는 방식을 복리라고 해요. 오래 둘수록 단리보다 많이 불어나요.',
      },
      {
        id: 'b4',
        type: 'matching',
        termId: 'compound',
        prompt: '용어와 뜻을\n짝지어 보세요',
        pairs: [
          { term: '복리', meaning: '이자에도 이자가 붙음' },
          { term: '단리', meaning: '원금에만 이자가 붙음' },
          { term: '원금', meaning: '처음 맡기거나 빌린 돈' },
          { term: '이자', meaning: '돈을 맡기거나 빌린 대가' },
        ],
        explanation: '복리와 단리의 차이는 기간이 길수록 커져요.',
      },
      {
        id: 'b5',
        type: 'ox',
        termId: 'simple-interest',
        prompt: '같은 금리라면 오래 둘수록\n단리가 복리보다 이자가 많다?',
        answer: 'X',
        explanation: '오래 둘수록 이자에도 이자가 붙는 복리가 더 많아요.',
      },
    ],
  },
}

export function getStageContent(sector: Sector) {
  const content = STAGE_CONTENT[sector]
  return {
    terms: content.termIds.map((id) => TERMS[id]),
    questions: content.questions,
  }
}

/** 오늘의 섹터 (목업: 요일 순환은 서버가 정함) */
export const TODAY = { sector: 'stock' as Sector, stage: 2 }
