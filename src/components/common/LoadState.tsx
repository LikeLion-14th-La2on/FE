/**
 * API를 불러오는 중 / 실패했을 때 화면 가운데에 보여 주는 안내
 * - Loading: 다람쥐 + "불러오고 있어요"
 * - LoadError: 서버가 준 메시지 + 다시 시도 버튼
 */
import Button from './Button'
import Character from './Character'

export function Loading({ label = '불러오고 있어요' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      <Character width={96} className="animate-pulse" />
      <p className="text-[14px] leading-[1.4] font-medium text-avocado-400">{label} · · ·</p>
    </div>
  )
}

export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      <Character width={96} />
      <p className="text-center text-[15px] leading-[1.4] font-bold text-herb">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-2 w-auto! px-8" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  )
}
