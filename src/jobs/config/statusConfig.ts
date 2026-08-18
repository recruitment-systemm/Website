import type { JobStatus } from '@/jobs/types/job'

interface StatusConfig {
  label: string
  text: string
  bg: string
  dot: string
}

export const JOB_STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    text: 'text-muted-foreground',
    bg: 'bg-muted',
    dot: 'bg-muted-foreground',
  },
  OPEN: {
    label: 'Open',
    text: 'text-approved',
    bg: 'bg-approved/10',
    dot: 'bg-approved',
  },
  CLOSED: {
    label: 'Closed',
    text: 'text-foreground/70',
    bg: 'bg-foreground/5',
    dot: 'bg-foreground/40',
  },
}
