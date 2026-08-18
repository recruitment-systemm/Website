import { cn } from '@/lib/utils'
import { AVATAR_PALETTE, hashToPaletteIndex } from '@/shared/utils/avatarPalette'

function getInitials(organizationName: string): string {
  const words = organizationName
    .replace(/[.,]/g, '')
    .trim()
    .split(/\s+/)
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

interface OrganizationAvatarProps {
  name: string
  className?: string
}

export function OrganizationAvatar({ name, className }: OrganizationAvatarProps) {
  const palette = AVATAR_PALETTE[hashToPaletteIndex(name, AVATAR_PALETTE.length)]

  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
        palette.bg,
        palette.text,
        className
      )}
    >
      {getInitials(name)}
    </span>
  )
}
