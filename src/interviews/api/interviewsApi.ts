import { applicationClient } from '@/shared/api/httpClient'
import { listCandidates } from '@/candidates/api/candidatesApi'
import type { Candidate } from '@/candidates/types/candidate'
import {
  FINAL_ROUND,
  INTERVIEW_ROUNDS,
  type Interview,
  type InterviewProgress,
  type InterviewRound,
  type RoundOutcome,
} from '@/interviews/types/interview'

export interface InterviewCandidate {
  candidate: Candidate
  interviews: Interview[]
  progress: InterviewProgress
  /** The next round to run, or null when every round has been cleared. */
  currentRound: InterviewRound | null
}

function deriveProgress(interviews: Interview[]): InterviewProgress {
  const progress: InterviewProgress = {}
  for (const interview of interviews) {
    if (interview.status === 'COMPLETED' && interview.passed !== null) {
      progress[interview.phase] = interview.passed ? 'PASSED' : 'FAILED'
    }
  }
  return progress
}

export function getRoundOutcome(progress: InterviewProgress, round: InterviewRound): RoundOutcome {
  return progress[round] ?? 'PENDING'
}

/**
 * The active (not cancelled) interview record for a round, if one exists —
 * this is what a round row needs to show a scheduled date/time or offer
 * "Cancel," as distinct from `getRoundOutcome`, which only cares about
 * COMPLETED results. A CANCELLED record for this phase is deliberately
 * ignored here (mirrors the backend's own duplicate-check, which excludes
 * CANCELLED — the phase is schedulable again after a cancellation).
 */
export function getActiveInterview(interviews: Interview[], round: InterviewRound): Interview | null {
  return interviews.find((interview) => interview.phase === round && interview.status !== 'CANCELLED') ?? null
}

/**
 * The first round that hasn't been passed yet. Rounds run in order, so this is
 * the only one that's actionable — a candidate can't sit their technical
 * before HR/Screening has cleared them.
 */
export function getCurrentRound(progress: InterviewProgress): InterviewRound | null {
  return INTERVIEW_ROUNDS.find((round) => getRoundOutcome(progress, round) !== 'PASSED') ?? null
}

async function fetchInterviews(applicationId: string): Promise<Interview[]> {
  try {
    return await applicationClient.get<Interview[]>(`/api/v1/interviews/application/${applicationId}`)
  } catch {
    return []
  }
}

/**
 * Candidates currently in the `INTERVIEW` stage of the board, with their round
 * progress attached. The board stays the source of truth for who's
 * interviewing: move someone into Interview and they appear here; pass or fail
 * them and they leave. Unlike before, the next round is **not** auto-created
 * here — `POST /interviews` is real scheduling now (the backend's own
 * success message calls it "Interview scheduled successfully"), so it only
 * happens when the user explicitly picks a date/time via `scheduleInterview`.
 */
export async function listInterviewCandidates(): Promise<InterviewCandidate[]> {
  const candidates = await listCandidates()
  const interviewing = candidates.filter((candidate) => candidate.stage === 'INTERVIEW')

  return Promise.all(
    interviewing.map(async (candidate) => {
      const interviews = await fetchInterviews(candidate.id)
      const progress = deriveProgress(interviews)
      const currentRound = getCurrentRound(progress)

      return { candidate, interviews, progress, currentRound }
    })
  )
}

/**
 * Schedules the given round for an application — `POST /interviews`. Only
 * legal when `validatePhaseOrder` on the backend is satisfied (the prior
 * round must be COMPLETED and passed, or this is SCREENING); the caller
 * becomes the interviewer of record automatically. `scheduledAt` is optional
 * on the backend (nullable column, no `@NotNull`), but the UI always
 * collects one — an "interview" with no time isn't really scheduled.
 */
export async function scheduleInterview(
  applicationId: string,
  round: InterviewRound,
  scheduledAt: string
): Promise<Interview> {
  return applicationClient.post<Interview>('/api/v1/interviews', {
    applicationId,
    phase: round,
    scheduledAt,
  })
}

/**
 * Cancels a still-`SCHEDULED` interview (`PATCH /interviews/{id}/cancel`).
 * The backend only allows this from `SCHEDULED` — a `COMPLETED` interview
 * can't be cancelled, and cancelling doesn't touch the application's status
 * at all. There's no un-cancel: a cancelled round's phase becomes
 * schedulable again from scratch (cancelled interviews are excluded from
 * the backend's duplicate-interview check), which is why the UI offers
 * "Reschedule" rather than "Undo cancel" after this.
 */
export async function cancelInterview(interviewId: string): Promise<Interview> {
  return applicationClient.patch<Interview>(`/api/v1/interviews/${interviewId}/cancel`)
}

export interface RecordOutcomeResult {
  progress: InterviewProgress
  /** Set when the outcome moved the candidate off the Interviews page. */
  movedTo: 'HIRED' | 'REJECTED' | null
}

/**
 * Records a round's outcome. The consequence to the candidate's application
 * status — failing any round rejects them, passing the FINAL round hires
 * them — is **not** applied here: `InterviewService.completeInterview` on
 * the backend already does this itself (`applyInterviewResult`, sets the
 * application's status directly, bypassing `ApplicationService`'s own
 * transition validation). Calling `setCandidateStage` afterward here would
 * race the backend's own write and 409 on the same-status check, since the
 * application has usually already moved by the time this resolves. The
 * `movedTo` return value only *describes* what the backend just did, for the
 * UI banner — it does not trigger a second write.
 */
export async function recordRoundOutcome(
  interviews: Interview[],
  round: InterviewRound,
  outcome: Exclude<RoundOutcome, 'PENDING'>,
  notes?: string
): Promise<RecordOutcomeResult> {
  const interview = getActiveInterview(interviews, round)
  if (!interview) return { progress: deriveProgress(interviews), movedTo: null }

  const trimmedNotes = notes?.trim() || undefined

  await applicationClient.patch<Interview>(`/api/v1/interviews/${interview.id}/complete`, {
    passed: outcome === 'PASSED',
    notes: trimmedNotes,
  })

  const updatedInterviews = interviews.map((item) =>
    item.id === interview.id
      ? { ...item, status: 'COMPLETED' as const, passed: outcome === 'PASSED', notes: trimmedNotes ?? null }
      : item
  )
  const progress = deriveProgress(updatedInterviews)

  if (outcome === 'FAILED') {
    return { progress, movedTo: 'REJECTED' }
  }

  if (round === FINAL_ROUND) {
    return { progress, movedTo: 'HIRED' }
  }

  return { progress, movedTo: null }
}
