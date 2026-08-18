import type { InterviewRound, RoundOutcome } from '@/interviews/types/interview'

interface RoundConfig {
  label: string
  shortLabel: string
  description: string
}

export const ROUND_CONFIG: Record<InterviewRound, RoundConfig> = {
  SCREENING: {
    label: 'Screening',
    shortLabel: 'Screening',
    description: 'Screening call — motivation, expectations, availability.',
  },
  HIRING_MANAGER: {
    label: 'Hiring Manager Interview',
    shortLabel: 'Hiring Manager',
    description: 'Role fit and experience, with the manager they’d report to.',
  },
  TECHNICAL: {
    label: 'Technical Interview',
    shortLabel: 'Technical',
    description: 'Hands-on assessment. Passing this hires the candidate.',
  },
}

interface OutcomeConfig {
  label: string
  text: string
  bg: string
}

/**
 * Outcome colours reuse the same semantic tokens as the candidate stages
 * they lead to — passing ends in `HIRED` (`--approved`), failing in
 * `REJECTED` (`--destructive`) — so the two screens read as one system.
 */
export const OUTCOME_CONFIG: Record<RoundOutcome, OutcomeConfig> = {
  PENDING: { label: 'Pending', text: 'text-muted-foreground', bg: 'bg-muted' },
  PASSED: { label: 'Passed', text: 'text-approved', bg: 'bg-approved/10' },
  FAILED: { label: 'Failed', text: 'text-destructive', bg: 'bg-destructive/10' },
}
