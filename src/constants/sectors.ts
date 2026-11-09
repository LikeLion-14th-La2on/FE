/** 섹터 정의: 📈 주식 apricot · 🏠 생활 금융 avocado · 📘 금융 기초 burnt-orange (칩 바탕 /200, 금융 기초만 /100) */
export type Sector = 'stock' | 'life' | 'basic'

export const SECTORS: Record<Sector, { label: string; emoji: string; chipClass: string }> = {
  stock: { label: '주식', emoji: '📈', chipClass: 'bg-apricot-200' },
  life: { label: '생활 금융', emoji: '🏠', chipClass: 'bg-avocado-200' },
  basic: { label: '금융 기초', emoji: '📘', chipClass: 'bg-burnt-orange-100' },
}
