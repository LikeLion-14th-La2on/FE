import type { Sector } from './sectors'

/**
 * 소재일 화면(Figma)의 섹터 칩 글자색: 📈 주식 apricot-700 · 🏠 생활 금융 herb · 📘 금융 기초 burnt-orange-600
 * 공통 SectorChip은 글자가 herb라서 className으로 덮어쓴다. 예) <SectorChip className={SECTOR_TEXT[s]} />
 */
export const SECTOR_TEXT: Record<Sector, string> = {
  stock: 'text-apricot-700!',
  life: 'text-herb!',
  basic: 'text-burnt-orange-600!',
}
