export const AVATAR_PALETTE = [
  { bg: 'bg-primary/15', text: 'text-primary' },
  { bg: 'bg-violet-500/15', text: 'text-violet-700 dark:text-violet-400' },
  { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400' },
  { bg: 'bg-approved/15', text: 'text-approved' },
  { bg: 'bg-destructive/15', text: 'text-destructive' },
]

/** Deterministic hash so the same string always lands on the same palette entry. */
export function hashToPaletteIndex(value: string, paletteLength: number): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash % paletteLength
}
