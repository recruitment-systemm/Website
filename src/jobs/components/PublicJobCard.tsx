import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { OrganizationAvatar } from '@/jobs/components/OrganizationAvatar'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import type { Job } from '@/jobs/types/job'

interface PublicJobCardProps {
  job: Job
  onApply: (job: Job) => void
}

export function PublicJobCard({ job, onApply }: PublicJobCardProps) {
  const organizationName = job.organizationName ?? 'Hiring organization'

  return (
    <Card className="flex flex-col justify-between transition-shadow hover:shadow-[0_1px_2px_rgba(11,18,32,0.04),0_12px_28px_-20px_rgba(11,18,32,0.35)]">
      <CardHeader className="flex flex-row items-start gap-3">
        <OrganizationAvatar name={organizationName} />
        <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
          <h3 className="truncate font-heading text-base leading-snug font-semibold text-foreground">
            {job.title}
          </h3>
          {job.organizationName && (
            <span className="truncate text-sm text-muted-foreground">{job.organizationName}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2.5">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          {job.address}
        </span>
        <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 border-t border-border bg-transparent">
        <span className="font-mono text-[11px] text-muted-foreground">
          Posted {formatRelativeTime(job.createdAt)}
        </span>
        <Button size="sm" onClick={() => onApply(job)}>
          Apply
        </Button>
      </CardFooter>
    </Card>
  )
}
