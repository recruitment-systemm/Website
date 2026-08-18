import { MapPin } from 'lucide-react'
import { JobRowActions } from '@/jobs/components/JobRowActions'
import { JobStatusBadge } from '@/jobs/components/JobStatusBadge'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import { googleMapsUrl } from '@/jobs/utils/googleMapsUrl'
import type { Job, JobStatus } from '@/jobs/types/job'

interface JobsTableProps {
  jobs: Job[]
  onStatusChange: (jobId: string, status: JobStatus) => void
}

export function JobsTable({ jobs, onStatusChange }: JobsTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
        No jobs match this view.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card ring-1 ring-foreground/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Job
            </th>
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Location
            </th>
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Status
            </th>
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Posted
            </th>
            <th className="w-10 px-5 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job) => (
            <tr key={job.id} className="transition-colors hover:bg-muted/40">
              <td className="px-5 py-3 font-medium whitespace-nowrap text-foreground">{job.title}</td>
              <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                <a
                  href={googleMapsUrl(job.latitude, job.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-primary hover:underline"
                  title="Open in Google Maps"
                >
                  <MapPin className="size-3.5 shrink-0" />
                  {job.address}
                </a>
              </td>
              <td className="px-5 py-3">
                <JobStatusBadge status={job.status} />
              </td>
              <td className="px-5 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                {formatRelativeTime(job.createdAt)}
              </td>
              <td className="px-5 py-3 text-right">
                <JobRowActions job={job} onStatusChange={onStatusChange} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
