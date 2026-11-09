/**
 * 복습 목업 데이터
 * - 카드뉴스 복습: 어제 재출제에서도 틀린 문제 (오늘 학습 전에 보여줌)
 * - 오답노트: 카드뉴스에서도 틀린 문제, 주차별로 모아 해설만 보여줌
 */
import type { Sector } from '@/constants/sectors'

export type ReviewCard = {
  id: string
  termId: string
  sector: Sector
  title: string
  body: string
  prompt: string
  answer: 'O' | 'X'
}

export const YESTERDAY_REVIEW: ReviewCard[] = [
  {
    id: 'r1',
    termId: 'dividend',
    sector: 'stock',
    title: '배당',
    body: '회사가 번 돈을 주주에게 나눠 주는 것. 현금 대신 주식으로 줄 수도 있어요.',
    prompt: '배당은 반드시 현금으로만 준다?',
    answer: 'X',
  },
  {
    id: 'r2',
    termId: 'jeonse-ratio',
    sector: 'life',
    title: '전세가율',
    body: '집값에서 전세보증금이 차지하는 비율. 높을수록 보증금을 돌려받기 어려워질 수 있어요.',
    prompt: '전세가율이 높을수록 보증금이 안전하다?',
    answer: 'X',
  },
]

export type WrongNoteItem = {
  id: string
  termId: string
  sector: Sector
  question: string
  myAnswer: string
  correctAnswer: string
  explanation: string
  studiedAt: string
}

export type WrongNoteWeek = { label: string; items: WrongNoteItem[] }

export const WRONG_NOTE_WEEKS: WrongNoteWeek[] = [
  {
    label: '11월 1주차',
    items: [
      {
        id: 'w1',
        termId: 'dividend',
        sector: 'stock',
        question: '배당은 현금으로만 준다?',
        myAnswer: 'O',
        correctAnswer: 'X',
        explanation:
          '배당은 현금 말고 주식으로도 줄 수 있어요. 이렇게 주식으로 주는 걸 주식배당이라고 해요.',
        studiedAt: '11월 3일 학습',
      },
      {
        id: 'w2',
        termId: 'jeonse-ratio',
        sector: 'life',
        question: '전세가율이란?',
        myAnswer: '①',
        correctAnswer: '②',
        explanation: '전세가율은 집값에서 전세보증금이 차지하는 비율이에요.',
        studiedAt: '11월 4일 학습',
      },
      {
        id: 'w3',
        termId: 'compound',
        sector: 'basic',
        question: '복리는 이자에도 이자가 붙는다?',
        myAnswer: 'X',
        correctAnswer: 'O',
        explanation: '복리는 원금과 그동안 붙은 이자를 합친 금액에 다시 이자가 붙어요.',
        studiedAt: '11월 5일 학습',
      },
    ],
  },
  { label: '11월 2주차', items: [] },
]
