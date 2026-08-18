import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/FormField'
import { ApiError } from '@/shared/api/httpClient'
import { scheduleInterview } from '@/interviews/api/interviewsApi'
import {
  scheduleInterviewSchema,
  type ScheduleInterviewFormValues,
} from '@/interviews/validation/scheduleInterviewSchema'
import { ROUND_CONFIG } from '@/interviews/config/roundConfig'
import type { Interview, InterviewRound } from '@/interviews/types/interview'

interface ScheduleInterviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  applicationId: string
  round: InterviewRound
  onScheduled: (interview: Interview) => void
}

export function ScheduleInterviewModal({
  open,
  onOpenChange,
  candidateName,
  applicationId,
  round,
  onScheduled,
}: ScheduleInterviewModalProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleInterviewFormValues>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: { scheduledAt: '' },
  })

  async function onSubmit(values: ScheduleInterviewFormValues) {
    setFormError(null)
    try {
      // datetime-local has no timezone — treat it as the scheduler's local
      // time and let the Date constructor resolve it, then send full ISO
      // (OffsetDateTime on the backend) rather than the bare local string.
      const interview = await scheduleInterview(
        applicationId,
        round,
        new Date(values.scheduledAt).toISOString()
      )
      onScheduled(interview)
      reset()
      onOpenChange(false)
    } catch (error) {
      // InvalidInterviewPhaseException (prior round not passed yet) and
      // DuplicateInterviewException (already has a live interview for this
      // phase) both come back as 409 with a specific, useful message —
      // surface it directly instead of a generic fallback.
      setFormError(
        error instanceof ApiError && error.status === 409
          ? error.message
          : 'Something went wrong scheduling this interview. Please try again.'
      )
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFormError(null)
      reset()
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Schedule {ROUND_CONFIG[round].shortLabel}</DialogTitle>
          <DialogDescription>
            {candidateName} — you'll be the interviewer on record for this round.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField label="Date & time" htmlFor="scheduledAt" error={errors.scheduledAt?.message}>
            <Input
              id="scheduledAt"
              type="datetime-local"
              aria-invalid={!!errors.scheduledAt}
              className="h-10"
              {...register('scheduledAt')}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Scheduling…
                </>
              ) : (
                'Schedule'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
