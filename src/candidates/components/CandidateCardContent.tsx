import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import { CandidateAvatar } from '@/candidates/components/CandidateAvatar'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import { getLayoffReason } from '@/candidates/utils/layoffReasonStore'
import type { Candidate } from '@/candidates/types/candidate'

interface CandidateCardContentProps {
  candidate: Candidate
}

export function CandidateCardContent({ candidate }: CandidateCardContentProps) {
  const [layoffReason, setLayoffReason] = useState<string | null>(null)

  useEffect(() => {
    if (candidate.stage === 'LAYOFF') {
      setLayoffReason(getLayoffReason(candidate.id))
    }
  }, [candidate.stage, candidate.id])

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-start gap-3">
        <CandidateAvatar name={candidate.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{candidate.name}</p>
          <p className="truncate text-xs text-muted-foreground">{candidate.email}</p>
        </div>
      </div>

      {layoffReason && (
        <p className="rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
          {layoffReason}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        {candidate.phone ? (
          <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <Phone className="size-3.5 shrink-0" />
            <span className="truncate">{candidate.phone}</span>
          </span>
        ) : (
          <span />
        )}
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
          Applied {formatRelativeTime(candidate.appliedAt)}
        </span>
      </div>
    </div>
  )
}
