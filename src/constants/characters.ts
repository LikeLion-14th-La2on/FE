/**
 * 캐릭터(옷) 그림: 옷마다 자세 4개 (인사 · 화이팅 · 도토리 · 생각)
 * - 기본 다람쥐(code 'basic')는 src/assets/squirrel*.webp
 * - 다른 옷은 src/assets/characters/{code}/{pose}.webp 로 넣으면 자동으로 잡힌다
 *   예) 부자 다람쥐 code가 'rich'면 → characters/rich/wave.webp, cheer.webp, acorn.webp, think.webp
 * - code는 서버 캐릭터 목록(GET /characters)의 code와 같아야 한다
 * - 그림이 없는 자세는 그 옷의 인사 자세 → 그것도 없으면 기본 다람쥐로 대신한다
 */
import squirrelAcorn from '@/assets/squirrel-acorn.webp'
import squirrelCheer from '@/assets/squirrel-cheer.webp'
import squirrelThink from '@/assets/squirrel-think.webp'
import squirrel from '@/assets/squirrel.webp'

export type CharacterPose = 'wave' | 'cheer' | 'acorn' | 'think'

export const DEFAULT_CHARACTER_CODE = 'basic'

const BASIC: Record<CharacterPose, string> = {
  wave: squirrel,
  cheer: squirrelCheer,
  acorn: squirrelAcorn,
  think: squirrelThink,
}

/** characters/{code}/{pose}.webp 파일을 빌드할 때 모두 모아 둔다 (새 폴더를 넣으면 코드 수정 없이 추가) */
const files = import.meta.glob<string>('../assets/characters/*/*.webp', {
  eager: true,
  import: 'default',
})

const OUTFITS: Record<string, Partial<Record<CharacterPose, string>>> = {}
for (const [path, url] of Object.entries(files)) {
  const match = /characters\/([^/]+)\/([^/]+)\.webp$/.exec(path)
  if (!match) continue
  const [, code, pose] = match
  ;(OUTFITS[code] ??= {})[pose as CharacterPose] = url
}

/** 옷(code) · 자세로 그림 주소. code가 없거나 그림이 없으면 기본 다람쥐 */
export function getCharacterImage(code: string | null | undefined, pose: CharacterPose = 'wave') {
  const outfit = code && code !== DEFAULT_CHARACTER_CODE ? OUTFITS[code] : undefined
  return outfit?.[pose] ?? outfit?.wave ?? BASIC[pose]
}
