/**
 * 다른 화면(AI 튜터·용어 상세)에 잠깐 다녀올 때 지금 화면 상태를 보관했다가,
 * 뒤로 돌아오면 한 번만 꺼내 쓴다. 꺼낸 뒤에는 지워서 새로 들어오면 처음 상태로 시작한다.
 * 스크롤 위치도 같이 보관해 돌아왔을 때 보던 곳을 그대로 보여 준다.
 */
import { useEffect, useLayoutEffect, useState } from 'react'

type Stored<T> = { state: T; scrollY: number }

function read<T>(key: string): Stored<T> | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Stored<T>) : null
  } catch {
    return null
  }
}

/** 다른 화면으로 넘어가기 직전에 부른다 */
export function saveReturnSnapshot<T>(key: string, state: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ state, scrollY: window.scrollY }))
  } catch {
    // 저장이 안 되면 돌아왔을 때 처음 상태로 보인다 (기존 동작)
  }
}

/** 돌아왔을 때 보관해 둔 상태 (없으면 null). 첫 렌더에서 한 번만 읽는다. */
export function useReturnSnapshot<T>(key: string): T | null {
  const [stored] = useState(() => read<T>(key))

  useEffect(() => {
    try {
      sessionStorage.removeItem(key)
    } catch {
      // 무시
    }
  }, [key])

  useLayoutEffect(() => {
    if (stored) window.scrollTo(0, stored.scrollY)
  }, [stored])

  return stored?.state ?? null
}
