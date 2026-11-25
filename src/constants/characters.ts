/**
 * 캐릭터(옷) 그림: 옷마다 전신 자세 5개 (인사 · 화이팅 · 도토리 · 생각 · 슬픔) + 카드에 손 올린 반신(peek)
 * - 기본 다람쥐(code 'basic')는 src/assets/squirrel*.webp
 * - 다른 옷은 src/assets/characters/{code}/{pose}.webp 로 넣으면 자동으로 잡힌다
 *   지금 옷: student(모범생) · summer(바캉스) · rich(부자)
 *   예) characters/rich/wave.webp, cheer.webp, acorn.webp, think.webp, sad.webp, peek.webp
 * - peek.webp는 300×300 칸에 기본 다람쥐(squirrel-peek.webp)와 같은 위치로 맞춘 그림
 * - code는 서버 캐릭터 목록(GET /characters)의 code와 같아야 한다
 * - 그림이 없는 자세는 그 옷의 인사 자세 → 그것도 없으면 기본 다람쥐로 대신한다
 *   (peek는 전신으로 대신할 수 없어서 바로 기본 다람쥐)
 */
import squirrelAcorn from '@/assets/squirrel-acorn.webp'
import squirrelCheer from '@/assets/squirrel-cheer.webp'
import squirrelPeek from '@/assets/squirrel-peek.webp'
import squirrelSad from '@/assets/squirrel-sad.webp'
import squirrelThink from '@/assets/squirrel-think.webp'
import squirrel from '@/assets/squirrel.webp'

/** 전신 자세 (Character 컴포넌트) */
export type CharacterPose = 'wave' | 'cheer' | 'acorn' | 'think' | 'sad'
/** 그림 종류: 전신 자세 + 카드에 손 올린 반신 (PeekSquirrel) */
export type CharacterImagePose = CharacterPose | 'peek'

export const DEFAULT_CHARACTER_CODE = 'basic'

const BASIC: Record<CharacterImagePose, string> = {
  wave: squirrel,
  cheer: squirrelCheer,
  acorn: squirrelAcorn,
  think: squirrelThink,
  sad: squirrelSad,
  peek: squirrelPeek,
}

/** characters/{code}/{pose}.webp 파일을 빌드할 때 모두 모아 둔다 (새 폴더를 넣으면 코드 수정 없이 추가) */
const files = import.meta.glob<string>('../assets/characters/*/*.webp', {
  eager: true,
  import: 'default',
})

const OUTFITS: Record<string, Partial<Record<CharacterImagePose, string>>> = {}
for (const [path, url] of Object.entries(files)) {
  const match = /characters\/([^/]+)\/([^/]+)\.webp$/.exec(path)
  if (!match) continue
  const [, code, pose] = match
  ;(OUTFITS[code] ??= {})[pose as CharacterImagePose] = url
}

/** FE에 이 옷 그림이 있는지 (basic은 src/assets/squirrel*.webp라 항상 있음) */
export function hasCharacterImage(code: string | null | undefined): code is string {
  return !!code && (code === DEFAULT_CHARACTER_CODE || code in OUTFITS)
}

/** 옷(code) · 자세로 그림 주소. code가 없거나 그림이 없으면 기본 다람쥐 */
export function getCharacterImage(
  code: string | null | undefined,
  pose: CharacterImagePose = 'wave',
) {
  const outfit = code && code !== DEFAULT_CHARACTER_CODE ? OUTFITS[code] : undefined
  const fallback = pose === 'peek' ? undefined : outfit?.wave
  return outfit?.[pose] ?? fallback ?? BASIC[pose]
}
