import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CandidateCardContent } from '@/candidates/components/CandidateCardContent'
import { cn } from '@/lib/utils'
import type { Candidate } from '@/candidates/types/candidate'

interface CandidateCardProps {
  candidate: Candidate
  disabled?: boolean
}

export function CandidateCard({ candidate, disabled }: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-none rounded-xl border border-border bg-card ring-1 ring-foreground/5 transition-shadow',
        !disabled && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40'
      )}
    >
      <CandidateCardContent candidate={candidate} />
    </div>
  )
}
