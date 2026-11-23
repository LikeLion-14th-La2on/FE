/**
 * 학습·레벨 테스트·복습 API가 함께 쓰는 문제 형식 (Notion API 명세서 기준)
 * - type: OX / MULTIPLE(4지선다) / SITUATION(상황형) / MATCHING(매칭)
 * - choices: OX는 null, 객관식·상황형은 보기 배열, 매칭은 { terms, meanings }
 * - 답: OX "O"/"X", 객관식·상황형 "0"부터 보기 번호, 매칭 {"용어": "뜻"}, 레벨 테스트 '잘 모르겠어요' "UNKNOWN"
 */
import type { Sector } from '@/constants/sectors'

export type QuestionType = 'OX' | 'MULTIPLE' | 'SITUATION' | 'MATCHING'

export type MatchingChoices = { terms: string[]; meanings: string[] }

export type QuestionChoices = string[] | MatchingChoices | null

export type AnswerValue = string | Record<string, string>

/** 서버 섹터 이름 → 화면 섹터 키 (색·아이콘). 모르는 이름이면 주식 색으로 */
const SECTOR_BY_NAME: Record<string, Sector> = {
  주식: 'stock',
  '생활 금융': 'life',
  '금융 기초': 'basic',
}

export function toSector(name: string): Sector {
  return SECTOR_BY_NAME[name] ?? 'stock'
}
