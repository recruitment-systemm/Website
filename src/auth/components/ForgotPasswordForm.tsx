import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/FormField'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/auth/validation/forgotPasswordSchema'
import { forgotPassword, OrganizationEmailNotFoundError, OrganizationNotAcceptedError } from '@/auth/api/authApi'

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null)
    try {
      await forgotPassword(values)
      setSubmittedEmail(values.email)
    } catch (error) {
      if (error instanceof OrganizationEmailNotFoundError || error instanceof OrganizationNotAcceptedError) {
        setFormError(error.message)
        return
      }
      setFormError('Something went wrong sending the reset link. Please try again.')
    }
  }

  if (submittedEmail) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            We've sent a link to reset your password to{' '}
            <span className="font-medium text-foreground">{submittedEmail}</span>. It expires in 15 minutes.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Forgot your password?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the email associated with your organization and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {formError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </div>
        )}

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            className="h-10"
            {...register('email')}
          />
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="h-10">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending link…
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
