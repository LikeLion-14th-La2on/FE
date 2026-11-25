/**
 * 학습 상수 (예전 학습 목업 중 아직 쓰는 값만 남김 — 용어 · 문제 · 단계 구성은 서버 API로 옮겨 감)
 * - STAGE_COUNT: 섹터마다 단계 수 (주소 검사 · 마지막 단계 판단)
 * - TODAY: 주소의 섹터 · 단계가 잘못됐을 때 대신 쓰는 값
 */
import type { Sector } from '@/constants/sectors'

export const STAGE_COUNT = 3

/** 주소가 잘못됐을 때 대신 보여 줄 섹터 · 단계 */
export const TODAY = { sector: 'stock' as Sector, stage: 2 }
