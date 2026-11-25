/**
 * 로그아웃 · 회원탈퇴할 때 이 기기에 남은 사용자별 값을 지운다
 * - 같은 기기에서 다른 계정으로 들어와도 이전 계정의 값이 보이지 않게
 * - 최근 본 용어 · 단어장(앱 안에 불러 둔 목록) · AI 튜터 남은 무료 횟수 · 시사 퀴즈 푼 결과
 */
import { clearSolvedNewsQuiz } from '@/api/newsQuiz'
import { clearFreeRemaining } from '@/api/tutor'
import { resetBookmarks } from '@/hooks/useBookmarks'
import { clearRecentTerms } from '@/hooks/useRecentTerms'

export function clearUserDeviceData() {
  clearRecentTerms()
  resetBookmarks()
  clearFreeRemaining()
  clearSolvedNewsQuiz()
}
