/**
 * Mapped 1:1 to Application-Interview-Services' `Interview.phase` enum — no
 * separate client vocabulary, unlike the old mock's HR/FIRST/SECOND.
 */
export type InterviewRound = 'SCREENING' | 'HIRING_MANAGER' | 'TECHNICAL'

/** Ordered — a candidate clears these in sequence, and the last one hires them. */
export const INTERVIEW_ROUNDS: readonly InterviewRound[] = [
  'SCREENING',
  'HIRING_MANAGER',
  'TECHNICAL',
] as const

export const FINAL_ROUND: InterviewRound = INTERVIEW_ROUNDS[INTERVIEW_ROUNDS.length - 1]

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

/**
 * One backend `Interview` record for a single round of one application.
 * `interviewerId` is always whoever created it (`InterviewService.createInterview`
 * sets it from the caller's own principal) — there's no way to assign a
 * different interviewer, so no "assign to" UI exists; scheduling an
 * interview makes the scheduler the interviewer of record.
 */
export interface Interview {
  id: string
  applicationId: string
  interviewerId: string
  phase: InterviewRound
  status: InterviewStatus
  scheduledAt: string | null
  notes: string | null
  passed: boolean | null
  createdAt: string
}

export type RoundOutcome = 'PENDING' | 'PASSED' | 'FAILED'

/** Per-candidate progress, derived from that candidate's `Interview[]`. */
export type InterviewProgress = Partial<Record<InterviewRound, RoundOutcome>>
