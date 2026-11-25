/** 캐릭터 API: 상점 (Notion API 명세서 · 마이페이지) */
import { api } from './client'

export type CharacterItem = {
  characterId: number
  /**
   * 그림 폴더 이름 (예: 'basic', 'rich') → src/assets/characters/{code}/
   * TODO: 백엔드 추가 요청 중 — 오기 전엔 없어서 기본 다람쥐로 보인다
   */
  code?: string
  name: string
  imageUrl: string | null
  /** 도토리 가격 (기본 캐릭터는 0) */
  price: number
  owned: boolean
  equipped: boolean
}

/** 살 수 있는 캐릭터 전체 + 내 보유 · 장착 여부 */
export const getCharacters = (signal?: AbortSignal) =>
  api<CharacterItem[]>('/api/v1/characters', { signal })

/**
 * 캐릭터 구매 (도토리 차감, 도토리 내역 사유 CHARACTER)
 * - 이미 보유 중이면 E409 (동시에 여러 번 눌러도 1건만 성공), 도토리가 부족하면 E400
 */
export const purchaseCharacter = (characterId: number) =>
  api<{ characterId: number; acornBalance: number }>(`/api/v1/characters/${characterId}/purchase`, {
    method: 'POST',
  })

/** 캐릭터 장착 (홈 · 마이페이지 캐릭터 이미지가 바뀐다). 보유하지 않은 캐릭터면 E403 */
export const equipCharacter = (characterId: number) =>
  api<{ equippedCharacterId: number; characterImageUrl: string | null }>(
    '/api/v1/users/me/character',
    { method: 'PATCH', body: { characterId } },
  )
