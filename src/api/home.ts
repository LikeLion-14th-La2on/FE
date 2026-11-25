/**
 * 홈 API (GET /api/v1/home)
 * - 서버가 홈 조회 때 연속 학습 끊김을 판정하고(보호권 자동 사용 · 도토리 떨어짐), 처리 후 값을 내려준다
 * - 홈 화면 · 마이페이지(보호권 수 · 도토리 잔액) · 내 숲(키우는 중인 나무)에서 쓴다
 */
import { api } from './client'

export type Home = {
  nickname: string | null
  /** 오늘의 섹터. 일요일(복습하는 날)은 null */
  todaySector: { sectorId: number; name: string } | null
  /** 오늘 학습을 했는지 */
  todayCompleted: boolean
  /** 오늘의 섹터에서 아직 안 끝낸 가장 앞 단계. 다 끝냈거나 일요일이면 null */
  nextStage: { stageId: number; stepNo: number; title: string } | null
  /** 카드뉴스 복습할 오답이 있는지 */
  hasCardReview: boolean
  /** 홈 '어제 틀린 문제' 버튼에 쓰는 개수 */
  yesterdayWrongCount: number
  streak: {
    /** 끊김 처리 후 연속 학습일 (끊겼으면 0) */
    currentCount: number
    /** 끊김 처리 후 지금 가진 보호권 수 (최대 2) */
    shieldCount: number
    /** 이번 주 월~일 학습 여부 7개 (오늘 이후는 false) */
    weekStudied: boolean[]
  }
  tree: {
    /** 지금 나무에 붙어 있는 도토리 0~7 (7개가 되면 숲으로) */
    acornCount: number
    /** 내 숲에 모은 나무 수 */
    treeCount: number
    /** 지금 나무에서 떨어져 바닥에 쌓인 도토리 수 (나무 완성 시 0) */
    fallenCount: number
    /** 이번 조회에서 끊겨서 도토리가 떨어졌는지 (같은 끊김으로는 한 번만 true) */
    acornFell: boolean
  }
  /** 끊김 처리 후 도토리 잔액 */
  acornBalance: number
  characterImageUrl: string | null
}

export const getHome = (signal?: AbortSignal) => api<Home>('/api/v1/home', { signal })
