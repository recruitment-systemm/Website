import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2, UploadCloud } from 'lucide-react'
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
import { applyToJob, DuplicateApplicationError } from '@/candidates/api/candidatesApi'
import { formatEgyptPhoneNumber } from '@/candidates/utils/formatEgyptPhoneNumber'
import { applyToJobSchema, type ApplyToJobFormValues } from '@/candidates/validation/applyToJobSchema'
import type { Job } from '@/jobs/types/job'

interface ApplyToJobModalProps {
  job: Job | null
  onOpenChange: (open: boolean) => void
}

export function ApplyToJobModal({ job, onOpenChange }: ApplyToJobModalProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplyToJobFormValues>({
    resolver: zodResolver(applyToJobSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      cv: undefined,
    },
  })

  async function onSubmit(values: ApplyToJobFormValues) {
    if (!job) return
    setFormError(null)
    try {
      const cvFile = values.cv as File

      await applyToJob({
        jobId: job.id,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        resumeFile: cvFile,
      })
      setSubmitted(true)
    } catch (error) {
      setFormError(
        error instanceof DuplicateApplicationError
          ? error.message
          : 'Something went wrong submitting your application. Please try again.'
      )
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFormError(null)
      setSubmitted(false)
      reset()
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={job !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-approved/10 text-approved">
              <CheckCircle2 className="size-6" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Application sent
            </h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your application for {job?.title} has been sent
              {job?.organizationName ? ` to ${job.organizationName}` : ''}. They'll reach out if
              it's a match.
            </p>
            <Button className="mt-2" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apply for {job?.title}</DialogTitle>
              <DialogDescription>
                {job?.organizationName ? `Applying to ${job.organizationName}. ` : ''}No account
                needed — they'll follow up by email.
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
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message}>
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    aria-invalid={!!errors.firstName}
                    className="h-10"
                    {...register('firstName')}
                  />
                </FormField>

                <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    aria-invalid={!!errors.lastName}
                    className="h-10"
                    {...register('lastName')}
                  />
                </FormField>
              </div>

              <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  aria-invalid={!!errors.email}
                  className="h-10"
                  {...register('email')}
                />
              </FormField>

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormField
                    label="Phone number"
                    htmlFor="phone"
                    error={fieldState.error?.message}
                    hint={!fieldState.error ? 'Optional.' : undefined}
                  >
                    <Input
                      id="phone"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="010 1234 5678"
                      maxLength={13}
                      aria-invalid={!!fieldState.error}
                      className="h-10"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(formatEgyptPhoneNumber(event.target.value))}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="cv"
                render={({ field, fieldState }) => (
                  <FormField
                    label="CV"
                    htmlFor="cv"
                    error={fieldState.error?.message}
                    hint={!fieldState.error ? 'PDF or DOCX — up to 10MB.' : undefined}
                  >
                    <label
                      htmlFor="cv"
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      <UploadCloud className="size-4 shrink-0" />
                      <span className="truncate">
                        {field.value ? field.value.name : 'Choose a file to upload'}
                      </span>
                    </label>
                    <input
                      ref={field.ref}
                      id="cv"
                      name={field.name}
                      type="file"
                      accept=".pdf,.docx"
                      className="sr-only"
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.files?.[0])}
                    />
                  </FormField>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit application'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
