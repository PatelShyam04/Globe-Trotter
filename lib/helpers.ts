export const CATEGORY_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  sightseeing: { label: 'Sightseeing', color: 'cat-sightseeing', emoji: '🏛️' },
  food: { label: 'Food & Dining', color: 'cat-food', emoji: '🍜' },
  adventure: { label: 'Adventure', color: 'cat-adventure', emoji: '🧗' },
  transport: { label: 'Transport', color: 'cat-transport', emoji: '✈️' },
  stay: { label: 'Stay', color: 'cat-stay', emoji: '🏨' },
  other: { label: 'Other', color: 'cat-other', emoji: '📌' },
}

export const REGION_FLAGS: Record<string, string> = {
  Europe: '🇪🇺',
  Asia: '🌏',
  Americas: '🌎',
  Africa: '🌍',
  Oceania: '🌊',
  'Middle East': '🌙',
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'Not set'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getDaysBetween(start: Date | string, end: Date | string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    France: '🇫🇷', Japan: '🇯🇵', USA: '🇺🇸', Italy: '🇮🇹',
    Spain: '🇪🇸', Germany: '🇩🇪', UK: '🇬🇧', Thailand: '🇹🇭',
    India: '🇮🇳', Australia: '🇦🇺', Brazil: '🇧🇷', Canada: '🇨🇦',
    Netherlands: '🇳🇱', Switzerland: '🇨🇭', Portugal: '🇵🇹',
    Greece: '🇬🇷', Turkey: '🇹🇷', Indonesia: '🇮🇩', Mexico: '🇲🇽',
    UAE: '🇦🇪', Singapore: '🇸🇬', 'South Korea': '🇰🇷', China: '🇨🇳',
    Morocco: '🇲🇦', Egypt: '🇪🇬', Argentina: '🇦🇷', Peru: '🇵🇪',
    'New Zealand': '🇳🇿', Vietnam: '🇻🇳', Cambodia: '🇰🇭',
  }
  return flags[country] || '🌍'
}
