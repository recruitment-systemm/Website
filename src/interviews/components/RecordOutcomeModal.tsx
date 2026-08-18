import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/shared/components/FormField'
import { ROUND_CONFIG } from '@/interviews/config/roundConfig'
import type { InterviewRound } from '@/interviews/types/interview'

interface RecordOutcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  round: InterviewRound
  outcome: 'PASSED' | 'FAILED'
  isSubmitting: boolean
  onConfirm: (notes: string) => void
}

/**
 * Notes are optional on the backend (`CompleteInterviewRequest.notes` has no
 * `@NotBlank`), collected here rather than always-visible on the round row —
 * they only matter at the moment of a decision, and most rounds won't need
 * them.
 */
export function RecordOutcomeModal({
  open,
  onOpenChange,
  candidateName,
  round,
  outcome,
  isSubmitting,
  onConfirm,
}: RecordOutcomeModalProps) {
  const [notes, setNotes] = useState('')

  function handleOpenChange(next: boolean) {
    if (!next) setNotes('')
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {outcome === 'PASSED' ? 'Pass' : 'Fail'} {ROUND_CONFIG[round].shortLabel}
          </DialogTitle>
          <DialogDescription>
            {candidateName}
            {outcome === 'FAILED'
              ? ' will be moved to Rejected.'
              : round === 'TECHNICAL'
                ? ' will be moved to Hired.'
                : ' clears this round.'}
          </DialogDescription>
        </DialogHeader>

        <FormField label="Notes (optional)" htmlFor="outcome-notes">
          <Textarea
            id="outcome-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="How did it go?"
            rows={4}
          />
        </FormField>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={outcome === 'FAILED' ? 'destructive' : 'default'}
            disabled={isSubmitting}
            onClick={() => onConfirm(notes)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : outcome === 'PASSED' ? (
              'Confirm pass'
            ) : (
              'Confirm fail'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
