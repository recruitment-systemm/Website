import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { CandidateCard } from '@/candidates/components/CandidateCard'
import { STAGE_CONFIG } from '@/candidates/config/stageConfig'
import { hasAnyLegalMove, type BoardStage } from '@/candidates/utils/board'
import type { Candidate } from '@/candidates/types/candidate'

interface CandidateBoardColumnProps {
  stage: BoardStage
  candidates: Candidate[]
  disabled?: boolean
}

export function CandidateBoardColumn({ stage, candidates, disabled }: CandidateBoardColumnProps) {
  const config = STAGE_CONFIG[stage]
  const { setNodeRef, isOver } = useDroppable({ id: stage, disabled })

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className={cn('flex items-center justify-between rounded-lg px-3 py-2', config.bg)}>
        <span className={cn('text-xs font-semibold tracking-wide uppercase', config.text)}>
          {config.label}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold',
            config.badgeBg,
            config.text
          )}
        >
          {candidates.length}
        </span>
      </div>

      <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex min-h-16 flex-col gap-3 rounded-lg transition-colors',
            isOver && 'bg-primary/5 ring-2 ring-primary/20'
          )}
        >
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              disabled={disabled || !hasAnyLegalMove(stage)}
            />
          ))}
          {candidates.length === 0 && (
            <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              No candidates
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
