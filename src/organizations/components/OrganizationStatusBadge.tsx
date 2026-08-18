import { cn } from '@/lib/utils'
import { ORGANIZATION_STATUS_CONFIG } from '@/organizations/config/statusConfig'
import type { OrganizationStatus } from '@/organizations/types/organization'

interface OrganizationStatusBadgeProps {
  status: OrganizationStatus
  className?: string
}

export function OrganizationStatusBadge({ status, className }: OrganizationStatusBadgeProps) {
  const config = ORGANIZATION_STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
