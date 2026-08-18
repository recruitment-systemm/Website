import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CandidateAvatar } from '@/candidates/components/CandidateAvatar'
import { STAGE_CONFIG } from '@/candidates/config/stageConfig'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import { cn } from '@/lib/utils'
import type { Candidate } from '@/candidates/types/candidate'

interface RecentCandidatesCardProps {
  candidates: Candidate[]
}

export function RecentCandidatesCard({ candidates }: RecentCandidatesCardProps) {
  const recent = [...candidates]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent candidates</CardTitle>
        <Link to="/dashboard/candidates" className="text-xs font-medium text-primary hover:underline">
          View board
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {recent.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No candidates yet.</p>
        ) : (
          recent.map((candidate) => {
            const config = STAGE_CONFIG[candidate.stage]
            return (
              <div
                key={candidate.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-muted/40"
              >
                <CandidateAvatar name={candidate.name} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    {candidate.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{candidate.email}</span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={cn('rounded-full px-2 py-0.5 font-mono text-[11px] font-medium', config.badgeBg, config.text)}>
                    {config.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatRelativeTime(candidate.appliedAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
