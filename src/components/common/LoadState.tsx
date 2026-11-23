/**
 * API를 불러오는 중 / 실패했을 때 화면 가운데에 보여 주는 안내
 * - Loading: 다람쥐 + "불러오고 있어요"
 * - LoadError: 서버가 준 메시지 + 다시 시도 버튼 (다시 시도가 소용없는 오류는 다른 버튼, 예: 홈으로)
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

type ErrorProps = {
  message: string
  onRetry?: () => void
  /** 다시 시도 대신 보여 줄 버튼 */
  action?: { label: string; onClick: () => void }
}

export function LoadError({ message, onRetry, action }: ErrorProps) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      <Character width={96} />
      <p className="text-center text-[15px] leading-[1.4] font-bold text-herb">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-2 w-auto! px-8" onClick={onRetry}>
          다시 시도
        </Button>
      )}
      {action && (
        <Button variant="secondary" className="mt-2 w-auto! px-8" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
