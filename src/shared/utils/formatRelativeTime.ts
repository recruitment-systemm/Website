export function formatRelativeTime(isoDate: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000))

  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
