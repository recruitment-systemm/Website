import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { STAGE_CONFIG } from '@/candidates/config/stageConfig'
import { CANDIDATE_STAGES, type Candidate } from '@/candidates/types/candidate'
import { cn } from '@/lib/utils'

interface PipelineSummaryProps {
  candidates: Candidate[]
}

export function PipelineSummary({ candidates }: PipelineSummaryProps) {
  const total = candidates.length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Candidate pipeline</CardTitle>
        <Link
          to="/dashboard/candidates"
          className="text-xs font-medium text-primary hover:underline"
        >
          View board
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {CANDIDATE_STAGES.map((stage) => {
          const count = candidates.filter((candidate) => candidate.stage === stage).length
          const percent = total === 0 ? 0 : Math.round((count / total) * 100)
          const config = STAGE_CONFIG[stage]

          return (
            <div key={stage} className="flex items-center gap-3">
              <span className={cn('w-24 shrink-0 text-xs font-medium', config.text)}>
                {config.label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full', config.badgeBg)}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {count}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
