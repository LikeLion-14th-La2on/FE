/** AI 튜터 말풍선 옆 다람쥐 얼굴 (Figma '캐릭터 아바타': avocado-100 원 36 안에 apricot-100 원 32) */
import squirrel from '@/assets/squirrel.webp'

export default function TutorAvatar() {
  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-avocado-100"
    >
      <span className="relative size-8 overflow-hidden rounded-full bg-apricot-100">
        <img
          src={squirrel}
          alt=""
          className="absolute max-w-none"
          style={{ left: -10.8, top: 0.4, width: 64 }}
          draggable={false}
        />
      </span>
    </span>
  )
}
