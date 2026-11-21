/**
 * 학습 세션을 못 불러왔을 때
 * - 잠긴 단계·오늘의 섹터가 아님(E403), 없는 단계(E404): 다시 해도 같으므로 홈으로
 * - 그 밖의 오류(인터넷 등): 다시 시도
 */
import { useNavigate } from 'react-router'

import type { ApiError } from '@/api/client'
import { LoadError } from '@/components/common'
import { ROUTES } from '@/router/routes'

export default function SessionError({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const navigate = useNavigate()
  if (error.status === 403 || error.status === 404) {
    return (
      <LoadError
        message={error.message}
        action={{ label: '홈으로', onClick: () => navigate(ROUTES.home, { replace: true }) }}
      />
    )
  }
  return <LoadError message={error.message} onRetry={onRetry} />
}
