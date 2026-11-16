/** 섹터 정의: 📈 주식 apricot · 🏠 생활 금융 avocado · 📘 금융 기초 burnt-orange (칩 바탕 /200, 금융 기초만 /100) */
export type Sector = 'stock' | 'life' | 'basic'

export const SECTORS: Record<Sector, { label: string; emoji: string; chipClass: string }> = {
  stock: { label: '주식', emoji: '📈', chipClass: 'bg-apricot-200' },
  life: { label: '생활 금융', emoji: '🏠', chipClass: 'bg-avocado-200' },
  basic: { label: '금융 기초', emoji: '📘', chipClass: 'bg-burnt-orange-100' },
}

/**
 * 요일별 오늘의 섹터: 월·목 주식 / 화·금 생활 금융 / 수·토 금융 기초
 * 일요일은 '복습하는 날'이라 오늘의 섹터가 없다(null). 아무 섹터나 학습해도 하루 학습으로 인정
 * (Date.getDay(): 0 일 ~ 6 토)
 * 홈에서는 서버가 준 todaySector를 쓰고, 이건 서버 값이 없을 때(목업·미리보기) 같은 규칙으로 맞추는 용도
 */
const SECTOR_BY_WEEKDAY: (Sector | null)[] = [
  null,
  'stock',
  'life',
  'basic',
  'stock',
  'life',
  'basic',
]

export function getSectorOfDay(date = new Date()): Sector | null {
  return SECTOR_BY_WEEKDAY[date.getDay()]
}
