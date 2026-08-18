import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JobStatusBadge } from '@/jobs/components/JobStatusBadge'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import type { Job } from '@/jobs/types/job'

interface RecentJobsCardProps {
  jobs: Job[]
}

export function RecentJobsCard({ jobs }: RecentJobsCardProps) {
  const recent = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent jobs</CardTitle>
        <Link to="/dashboard/jobs" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {recent.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No jobs posted yet.</p>
        ) : (
          recent.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-muted/40"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-foreground">{job.title}</span>
                <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  {job.address}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <JobStatusBadge status={job.status} />
                <span className="font-mono text-[11px] text-muted-foreground">
                  {formatRelativeTime(job.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
