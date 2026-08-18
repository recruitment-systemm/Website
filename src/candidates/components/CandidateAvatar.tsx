import { cn } from '@/lib/utils'
import { AVATAR_PALETTE, hashToPaletteIndex } from '@/shared/utils/avatarPalette'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

interface CandidateAvatarProps {
  name: string
}

export function CandidateAvatar({ name }: CandidateAvatarProps) {
  const palette = AVATAR_PALETTE[hashToPaletteIndex(name, AVATAR_PALETTE.length)]

  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        palette.bg,
        palette.text
      )}
    >
      {getInitials(name)}
    </span>
  )
}
