import { Mail } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CandidateAvatar } from '@/candidates/components/CandidateAvatar'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import { InterviewRoundRow } from '@/interviews/components/InterviewRoundRow'
import { getActiveInterview, getRoundOutcome } from '@/interviews/api/interviewsApi'
import { INTERVIEW_ROUNDS, type Interview, type InterviewRound } from '@/interviews/types/interview'
import type { InterviewCandidate } from '@/interviews/api/interviewsApi'

interface InterviewCandidateCardProps {
  item: InterviewCandidate
  busyRound: InterviewRound | null
  /** `candidateId` doubles as the `applicationId` — a `Candidate` here *is* an application (see `toCandidate` in candidatesApi.ts). */
  onSchedule: (candidateId: string, round: InterviewRound) => void
  onCancel: (candidateId: string, interview: Interview) => void
  onRecord: (candidateId: string, round: InterviewRound, outcome: 'PASSED' | 'FAILED') => void
}

export function InterviewCandidateCard({
  item,
  busyRound,
  onSchedule,
  onCancel,
  onRecord,
}: InterviewCandidateCardProps) {
  const { candidate, interviews, progress, currentRound } = item
  const passedCount = INTERVIEW_ROUNDS.filter(
    (round) => getRoundOutcome(progress, round) === 'PASSED'
  ).length

  return (
    <Card>
      {/* `flex` is explicit because CardHeader is a grid by default. */}
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CandidateAvatar name={candidate.name} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-heading text-base font-semibold text-foreground">
              {candidate.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3 shrink-0" />
              {candidate.email}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-[11px] font-medium text-muted-foreground">
            {passedCount}/{INTERVIEW_ROUNDS.length} rounds
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Applied {formatRelativeTime(candidate.appliedAt)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {INTERVIEW_ROUNDS.map((round) => (
          <InterviewRoundRow
            key={round}
            round={round}
            outcome={getRoundOutcome(progress, round)}
            interview={getActiveInterview(interviews, round)}
            isCurrent={currentRound === round}
            isBusy={busyRound === round}
            onSchedule={(nextRound) => onSchedule(candidate.id, nextRound)}
            onCancel={(interview) => onCancel(candidate.id, interview)}
            onRecord={(nextRound, outcome) => onRecord(candidate.id, nextRound, outcome)}
          />
        ))}
      </CardContent>
    </Card>
  )
}
