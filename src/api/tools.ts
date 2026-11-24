/** 금융 도구 API (Notion API 명세서 · 금융 도구) */
import { api } from './client'

/** 대출 상환 비교 입력값 (principal: 원, rate: 연 %, months: 개월) */
export type LoanParams = { principal: number; rate: number; months: number }
/**
 * 복리 계산기 입력값 (principal: 처음 넣는 돈, deposit: 매달 넣는 돈, rate: 연 %, years: 년)
 * TODO: 명세에 LOAN 예시만 있어서 COMPOUND의 params 필드 이름은 가정. 백엔드와 확인할 것
 */
export type CompoundParams = { principal: number; deposit: number; rate: number; years: number }

/**
 * 금리 변동 시뮬레이터 입력값 (rateChange: 금리 변동폭 %p, 예: 1 = +1%p)
 * TODO: 명세에 RATE_CHANGE params 예시가 없어 필드 이름은 가정. 백엔드와 확인할 것
 */
export type RateChangeParams = {
  principal: number
  rate: number
  months: number
  rateChange: number
}

type ToolParams = { LOAN: LoanParams; COMPOUND: CompoundParams; RATE_CHANGE: RateChangeParams }
export type ToolType = keyof ToolParams
export type ParamsOf<T extends ToolType> = ToolParams[T]

/** 저장해 둔 입력값. 저장한 적이 없으면 null */
export const getToolConditions = <T extends ToolType>(toolType: T, signal?: AbortSignal) =>
  api<{ toolType: T; params: ParamsOf<T> } | null>(
    `/api/v1/tools/conditions?${new URLSearchParams({ toolType })}`,
    { signal },
  )

/** 입력값 저장 (도구별로 하나, 있으면 덮어씀) */
export const saveToolConditions = <T extends ToolType>(toolType: T, params: ParamsOf<T>) =>
  api<null>('/api/v1/tools/conditions', { method: 'PUT', body: { toolType, params } })
