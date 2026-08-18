import type { CandidateStage } from '@/candidates/types/candidate'

interface StageConfig {
  label: string
  text: string
  bg: string
  badgeBg: string
}

export const STAGE_CONFIG: Record<CandidateStage, StageConfig> = {
  SOURCED: {
    label: 'Sourced',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    badgeBg: 'bg-amber-500/20',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    text: 'text-primary',
    bg: 'bg-primary/10',
    badgeBg: 'bg-primary/20',
  },
  INTERVIEW: {
    label: 'Interview',
    text: 'text-violet-700 dark:text-violet-400',
    bg: 'bg-violet-500/10',
    badgeBg: 'bg-violet-500/20',
  },
  HIRED: {
    label: 'Hired',
    text: 'text-approved',
    bg: 'bg-approved/10',
    badgeBg: 'bg-approved/20',
  },
  REJECTED: {
    label: 'Rejected',
    text: 'text-destructive',
    bg: 'bg-destructive/10',
    badgeBg: 'bg-destructive/20',
  },
  // Reuses a neutral treatment distinct from REJECTED's red — both are
  // terminal, but LAYOFF isn't a rejection, so it shouldn't read as one.
  LAYOFF: {
    label: 'Layoff',
    text: 'text-muted-foreground',
    bg: 'bg-muted',
    badgeBg: 'bg-muted',
  },
}
