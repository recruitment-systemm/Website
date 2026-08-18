import { Calendar, Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OUTCOME_CONFIG, ROUND_CONFIG } from '@/interviews/config/roundConfig'
import { FINAL_ROUND, type Interview, type InterviewRound, type RoundOutcome } from '@/interviews/types/interview'

interface InterviewRoundRowProps {
  round: InterviewRound
  outcome: RoundOutcome
  /** The active (non-cancelled) interview record for this round, if scheduled. */
  interview: Interview | null
  /** Only the current round is actionable — rounds run in order. */
  isCurrent: boolean
  isBusy: boolean
  onSchedule: (round: InterviewRound) => void
  onCancel: (interview: Interview) => void
  onRecord: (round: InterviewRound, outcome: 'PASSED' | 'FAILED') => void
}

function formatScheduledAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * No "undo" is offered once a round is decided — the backend only supports
 * `complete` (this outcome) and `cancel` (marks the round `CANCELLED`, not a
 * true revert to `SCHEDULED`), so a mis-click can no longer be silently
 * corrected the way the mock allowed. See the interview integration report
 * for the full gap.
 */
export function InterviewRoundRow({
  round,
  outcome,
  interview,
  isCurrent,
  isBusy,
  onSchedule,
  onCancel,
  onRecord,
}: InterviewRoundRowProps) {
  const config = ROUND_CONFIG[round]
  const outcomeConfig = OUTCOME_CONFIG[outcome]
  const isDecided = outcome !== 'PENDING'
  // A later round the candidate hasn't reached yet.
  const isLocked = !isCurrent && !isDecided
  const isScheduled = interview?.status === 'SCHEDULED'

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        isCurrent ? 'border-primary/40 bg-primary/5' : 'border-border',
        isLocked && 'opacity-60'
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
            outcome === 'PASSED' && 'bg-approved text-approved-foreground',
            outcome === 'FAILED' && 'bg-destructive text-destructive-foreground',
            outcome === 'PENDING' && 'border border-border text-muted-foreground'
          )}
        >
          {outcome === 'PASSED' && <Check className="size-3.5" strokeWidth={3} />}
          {outcome === 'FAILED' && <X className="size-3.5" strokeWidth={3} />}
        </span>

        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{config.label}</span>
            {isDecided && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-mono text-[11px] font-medium',
                  outcomeConfig.bg,
                  outcomeConfig.text
                )}
              >
                {outcomeConfig.label}
              </span>
            )}
            {isCurrent && isScheduled && !isDecided && interview?.scheduledAt && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
                <Calendar className="size-3" />
                {formatScheduledAt(interview.scheduledAt)}
              </span>
            )}
            {round === FINAL_ROUND && !isDecided && (
              <span className="rounded-full bg-approved/10 px-2 py-0.5 font-mono text-[11px] font-medium text-approved">
                Final
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{config.description}</span>
          {isDecided && interview?.notes && (
            <p className="mt-1 text-xs text-muted-foreground italic">"{interview.notes}"</p>
          )}
        </div>
      </div>

      {isCurrent && !isDecided && (
        <div className="flex shrink-0 items-center gap-2 sm:pl-3">
          {!isScheduled ? (
            <Button size="sm" className="h-8" disabled={isBusy} onClick={() => onSchedule(round)}>
              {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Calendar className="size-3.5" />}
              Schedule
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                className="h-8"
                disabled={isBusy}
                onClick={() => onRecord(round, 'PASSED')}
              >
                {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                Pass
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-destructive hover:text-destructive"
                disabled={isBusy}
                onClick={() => onRecord(round, 'FAILED')}
              >
                <X className="size-3.5" />
                Fail
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-muted-foreground hover:text-foreground"
                disabled={isBusy}
                onClick={() => interview && onCancel(interview)}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
