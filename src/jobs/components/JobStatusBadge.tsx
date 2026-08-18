import { cn } from '@/lib/utils'
import { JOB_STATUS_CONFIG } from '@/jobs/config/statusConfig'
import type { JobStatus } from '@/jobs/types/job'

interface JobStatusBadgeProps {
  status: JobStatus
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = JOB_STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium',
        config.bg,
        config.text
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
