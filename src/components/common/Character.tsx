/**
 * 3D 다람쥐 캐릭터 (Figma '캐릭터(3D 다람쥐)')
 * - 전신 이미지 + 아래 바닥 그림자(coconut-600 타원, 흐림)
 * - width: 이미지 폭(px). Figma 수치 ÷ 2.5 (결과 343 → 137, 단계 완수 428 → 171, 빈 상태 240 → 96)
 * - pose: 화면 분위기에 맞는 다람쥐
 *   - wave(기본, 손 인사): 로그인 · 닉네임 등 인사하는 화면
 *   - cheer(주먹 쥐고 화이팅): 레벨 테스트 안내 · 결과처럼 시작을 응원하는 화면
 *   - acorn(도토리 안기): 단계 완수 · 나무 수확처럼 도토리를 받는 화면
 *   - think(생각하기): 불러오는 중 · 오류 · 오답노트 빈 화면
 * - 그림은 지금 장착한 옷의 그 자세 (옷 그림이 없으면 기본 다람쥐)
 * - 자세마다 그림 비율이 달라도 차지하는 칸(폭 × 높이)은 같게 맞춘다 (화면 배치가 바뀌지 않게)
 */
import clsx from 'clsx'

import { getCharacterImage, type CharacterPose } from '@/constants/characters'
import { useEquippedCharacterCode } from '@/hooks/useEquippedCharacter'

export type { CharacterPose }

/** 기본 다람쥐 그림의 높이 ÷ 폭 (525 / 480). 다른 자세도 이 높이 안에 맞춘다 */
const IMAGE_RATIO = 1.094

export default function Character({
  width = 137,
  pose = 'wave',
  className,
}: {
  width?: number
  pose?: CharacterPose
  className?: string
}) {
  const code = useEquippedCharacterCode()
  return (
    <div className={clsx('relative shrink-0', className)} style={{ width, height: width * 1.146 }}>
      <span
        aria-hidden
        className="absolute rounded-[50%] bg-coconut-600 blur-[6px]"
        style={{ left: width * 0.12, bottom: 0, width: width * 0.62, height: width * 0.088 }}
      />
      <img
        src={getCharacterImage(code, pose)}
        alt="다람쥐 캐릭터"
        // 자세마다 비율이 달라서 높이를 고정하고 폭은 그림에 맞춘다 (칸 안 가운데)
        className="relative max-w-none object-contain"
        style={{ width: '100%', height: width * IMAGE_RATIO }}
        draggable={false}
      />
    </div>
  )
}
