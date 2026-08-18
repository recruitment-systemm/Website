import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Job, JobStatus } from '@/jobs/types/job'

interface JobRowActionsProps {
  job: Job
  onStatusChange: (jobId: string, status: JobStatus) => void
}

export function JobRowActions({ job, onStatusChange }: JobRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Job actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {job.status === 'DRAFT' && (
          <DropdownMenuItem onSelect={() => onStatusChange(job.id, 'OPEN')}>Publish</DropdownMenuItem>
        )}
        {job.status === 'OPEN' && (
          <DropdownMenuItem onSelect={() => onStatusChange(job.id, 'CLOSED')}>Close</DropdownMenuItem>
        )}
        {job.status === 'CLOSED' && (
          <DropdownMenuItem onSelect={() => onStatusChange(job.id, 'OPEN')}>Reopen</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
