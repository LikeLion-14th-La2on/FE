/**
 * 휴대폰·브라우저 뒤로가기를 바로 처리하지 않고 확인 시트를 띄운다 (문제 풀이·레벨 테스트).
 * - 막는 건 뒤로가기(POP)뿐이다. 버튼으로 이동하는 것(AI 튜터, 결과 보기, 나가기)은 그대로 된다.
 * - 뒤로가기를 누르면 화면은 그대로 두고 onBack을 부른다 → 나가기 확인 시트를 연다.
 */
import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router'

export function useConfirmBack(onBack: () => void, enabled = true) {
  const blocker = useBlocker(({ historyAction }) => enabled && historyAction === 'POP')
  const onBackRef = useRef(onBack)

  useEffect(() => {
    onBackRef.current = onBack
  })

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    blocker.reset()
    onBackRef.current()
  }, [blocker])
}
