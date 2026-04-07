export const C = {
  sand:       '#F5F0E8',
  sandDark:   '#EDE6D6',
  ink:        '#1A1A2E',
  inkLight:   '#3D3D5C',
  inkMuted:   '#8888A4',
  terra:      '#C4622D',
  terraLight: '#E8895A',
  terraPale:  '#F5E6DC',
  teal:       '#2A7D6F',
  tealLight:  '#3DADA0',
  tealPale:   '#D6EDEB',
  gold:       '#C89B3C',
  goldPale:   '#F5EDDA',
  danger:     '#C0392B',
  dangerPale: '#FDECEA',
  white:      '#FFFFFF',
} as const

export type CategoryMeta = {
  color: string
  pale: string
  barColor: string
  gradient: string
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  Food:       { color: C.terra,     pale: C.terraPale, barColor: C.terra,     gradient: 'linear-gradient(135deg, #C4622D, #E8895A)' },
  Transport:  { color: C.teal,      pale: C.tealPale,  barColor: C.tealLight, gradient: 'linear-gradient(135deg, #2A7D6F, #3DADA0)' },
  Lodging:    { color: C.gold,      pale: C.goldPale,  barColor: C.gold,      gradient: 'linear-gradient(135deg, #C89B3C, #E8C06A)' },
  Activities: { color: C.tealLight, pale: C.tealPale,  barColor: C.tealLight, gradient: 'linear-gradient(135deg, #3DADA0, #2A7D6F)' },
  Supplies:   { color: '#7B6EA0',   pale: '#EEEAF5',   barColor: '#7B6EA0',   gradient: 'linear-gradient(135deg, #7B6EA0, #9B8EC0)' },
  Other:      { color: C.inkMuted,  pale: C.sandDark,  barColor: C.inkMuted,  gradient: 'linear-gradient(135deg, #8888A4, #AAAABC)' },
}

// Deterministic banner gradients by destination (fallback when no photo)
const DESTINATION_GRADIENTS = [
  'linear-gradient(135deg, #1A1A2E 0%, #2A4858 100%)',
  'linear-gradient(135deg, #4A1942 0%, #8B3A8B 100%)',
  'linear-gradient(135deg, #1A3A1A 0%, #2D7A3A 100%)',
  'linear-gradient(135deg, #2A1A0E 0%, #8B5A2B 100%)',
  'linear-gradient(135deg, #0E1A2A 0%, #2B5A8B 100%)',
  'linear-gradient(135deg, #1A0E2A 0%, #5A2B8B 100%)',
  'linear-gradient(135deg, #1A2A0E 0%, #3A6B1A 100%)',
  'linear-gradient(135deg, #2A0E0E 0%, #8B2B2B 100%)',
]

export function destinationGradient(destination: string): string {
  let hash = 0
  for (let i = 0; i < destination.length; i++) {
    hash = destination.charCodeAt(i) + ((hash << 5) - hash)
  }
  return DESTINATION_GRADIENTS[Math.abs(hash) % DESTINATION_GRADIENTS.length]
}

export function getTripStatus(startDate: string, endDate: string): 'active' | 'upcoming' | 'completed' {
  const today = new Date().toISOString().split('T')[0]
  if (today < startDate) return 'upcoming'
  if (today > endDate) return 'completed'
  return 'active'
}

export function fmtDate(d: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', opts)
}

export function fmtDateFull(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
