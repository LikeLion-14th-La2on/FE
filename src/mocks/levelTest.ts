/**
 * 레벨 테스트 목업: 섹터 3개 × 3단계 × 단계당 2문제 = 18문제
 * 시작 단계 규칙(목업): 1단계부터 차례로, 같은 단계 2문제를 모두 맞히면 그 단계 통과.
 * 처음으로 통과하지 못한 단계에서 시작한다. (전부 통과하면 마지막 단계)
 */
import type { Sector } from '@/constants/sectors'

import { STAGE_COUNT } from './learn'

export type LevelQuestion = {
  id: string
  sector: Sector
  stage: number
  prompt: string
  answer: 'O' | 'X'
  explanation: string
}

const q = (
  sector: Sector,
  stage: number,
  n: number,
  prompt: string,
  answer: 'O' | 'X',
  explanation: string,
): LevelQuestion => ({ id: `${sector}-${stage}-${n}`, sector, stage, prompt, answer, explanation })

export const LEVEL_QUESTIONS: LevelQuestion[] = [
  q('stock', 1, 1, '주식을 사면 그 회사의\n주주가 된다?', 'O', '주식을 1주라도 가지면 주주예요.'),
  q('stock', 1, 2, '배당은 반드시\n현금으로만 준다?', 'X', '주식으로 주는 주식배당도 있어요.'),
  q('stock', 2, 1, '주가가 오르면\n시가총액도 오른다?', 'O', '시가총액은 주가 × 주식 수예요.'),
  q(
    'stock',
    2,
    2,
    'PER이 높을수록\n주가가 싸다는 뜻이다?',
    'X',
    'PER이 높으면 이익에 비해 주가가 비싼 편이에요.',
  ),
  q(
    'stock',
    3,
    1,
    '공매도는 주가가 오를 때\n이익을 본다?',
    'X',
    '공매도는 주가가 내려야 이익이에요.',
  ),
  q(
    'stock',
    3,
    2,
    'ETF는 거래소에서\n주식처럼 사고팔 수 있다?',
    'O',
    'ETF는 상장된 펀드라 주식처럼 거래해요.',
  ),
  q(
    'life',
    1,
    1,
    '월급에서 4대보험료가\n빠져나간다?',
    'O',
    '국민연금·건강보험·고용보험 등이 빠져요.',
  ),
  q(
    'life',
    1,
    2,
    '체크카드는 통장 잔액보다\n많이 쓸 수 있다?',
    'X',
    '체크카드는 잔액 안에서만 쓸 수 있어요.',
  ),
  q(
    'life',
    2,
    1,
    '원리금균등상환은 매달\n갚는 금액이 같다?',
    'O',
    '원금과 이자를 합쳐 매달 같은 금액을 내요.',
  ),
  q(
    'life',
    2,
    2,
    '대출 금리가 오르면\n변동금리 대출 이자도 오른다?',
    'O',
    '변동금리는 기준 금리를 따라 바뀌어요.',
  ),
  q(
    'life',
    3,
    1,
    '전세가율이 높을수록\n보증금이 안전하다?',
    'X',
    '전세가율이 높으면 보증금을 떼일 위험이 커요.',
  ),
  q(
    'life',
    3,
    2,
    '확정일자를 받으면 보증금을\n지키는 데 도움이 된다?',
    'O',
    '확정일자는 보증금 우선순위를 지켜 줘요.',
  ),
  q(
    'basic',
    1,
    1,
    '복리는 이자에도\n이자가 붙는다?',
    'O',
    '원금과 이자를 합친 금액에 이자가 붙어요.',
  ),
  q(
    'basic',
    1,
    2,
    '예금자보호는 은행당 무제한이다?',
    'X',
    '1인당 금융회사별로 한도가 정해져 있어요.',
  ),
  q(
    'basic',
    2,
    1,
    '물가가 오르면 돈의\n가치는 떨어진다?',
    'O',
    '같은 돈으로 살 수 있는 물건이 줄어요.',
  ),
  q(
    'basic',
    2,
    2,
    '기준금리를 올리면 보통\n예금 금리도 내려간다?',
    'X',
    '기준금리가 오르면 예금 금리도 따라 오르는 편이에요.',
  ),
  q(
    'basic',
    3,
    1,
    '환율이 오르면 해외여행\n경비가 늘어난다?',
    'O',
    '같은 외화를 사려면 원화가 더 필요해요.',
  ),
  q(
    'basic',
    3,
    2,
    '경기가 나빠지면 보통\n실업률이 내려간다?',
    'X',
    '경기가 나빠지면 실업률은 오르는 편이에요.',
  ),
]

export type LevelAnswer = 'O' | 'X' | 'unknown'
export type LevelResult = Record<Sector, number>

export function calcStartStages(answers: Record<string, LevelAnswer>): LevelResult {
  const result = {} as LevelResult
  for (const sector of ['stock', 'life', 'basic'] as Sector[]) {
    let start = 1
    for (let stage = 1; stage <= STAGE_COUNT; stage++) {
      const qs = LEVEL_QUESTIONS.filter((x) => x.sector === sector && x.stage === stage)
      const passed = qs.every((x) => answers[x.id] === x.answer)
      if (!passed) break
      start = Math.min(stage + 1, STAGE_COUNT)
    }
    result[sector] = start
  }
  return result
}

export const ALL_FIRST_STAGE: LevelResult = { stock: 1, life: 1, basic: 1 }
