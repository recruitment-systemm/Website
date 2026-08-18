import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/shared/components/FormField'
import { cn } from '@/lib/utils'
import {
  LAYOFF_REASON_CATEGORIES,
  layoffReasonSchema,
  type LayoffReasonFormValues,
} from '@/candidates/validation/layoffReasonSchema'

interface LayoffReasonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  onConfirm: (reason: string) => void
}

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Collects a reason before confirming a HIRED → LAYOFF move. The backend has
 * no field to store this at all (`ApplicationEntity`/`UpdateApplicationStatusRequest`
 * only carry `status`) — the composed reason is saved to `localStorage`
 * (see `layoffReasonStore.ts`), not the server, so it's this browser only
 * and won't be visible to teammates or survive a cleared cache. The status
 * change itself (the real PATCH) still goes through the normal API.
 */
export function LayoffReasonModal({
  open,
  onOpenChange,
  candidateName,
  onConfirm,
}: LayoffReasonModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LayoffReasonFormValues>({
    resolver: zodResolver(layoffReasonSchema),
    defaultValues: { category: undefined, details: '', effectiveDate: today() },
  })

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function onSubmit(values: LayoffReasonFormValues) {
    const reason = [
      values.category,
      values.details?.trim() ? `— ${values.details.trim()}` : null,
      `(effective ${values.effectiveDate})`,
    ]
      .filter(Boolean)
      .join(' ')
    onConfirm(reason)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Layoff</DialogTitle>
          <DialogDescription>
            {candidateName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Controller
            control={control}
            name="category"
            render={({ field, fieldState }) => (
              <FormField label="Reason" htmlFor="layoff-category" error={fieldState.error?.message}>
                <div role="radiogroup" aria-label="Reason" className="flex flex-col gap-1.5">
                  {LAYOFF_REASON_CATEGORIES.map((option) => {
                    const isSelected = field.value === option
                    return (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => field.onChange(option)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary font-medium'
                            : 'border-input text-foreground hover:border-primary/40'
                        )}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </FormField>
            )}
          />

          <FormField label="Effective date" htmlFor="layoff-date" error={errors.effectiveDate?.message}>
            <Input id="layoff-date" type="date" className="h-10" {...register('effectiveDate')} />
          </FormField>

          <FormField label="Details (optional)" htmlFor="layoff-details" error={errors.details?.message}>
            <Textarea
              id="layoff-details"
              rows={3}
              placeholder="Any additional context…"
              {...register('details')}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Move to Layoff</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
