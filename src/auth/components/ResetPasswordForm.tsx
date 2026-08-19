import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/FormField'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/auth/validation/resetPasswordSchema'
import { InvalidResetTokenError, resetPassword, verifyResetPasswordToken } from '@/auth/api/authApi'

type TokenState = 'verifying' | 'valid' | 'invalid'

function InvalidTokenNotice() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="size-5" />
      </div>
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          This link is invalid or expired
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Password reset links expire 15 minutes after they're sent. Request a new one to continue.
        </p>
      </div>
      <Button asChild className="h-10">
        <Link to="/forgot-password">Request a new link</Link>
      </Button>
    </div>
  )
}

function ResetPasswordSuccess() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="size-5" />
      </div>
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Password reset
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Your password has been updated. You've been signed out everywhere else — sign in again with your new
          password.
        </p>
      </div>
      <Button asChild className="h-10">
        <Link to="/login">Continue to sign in</Link>
      </Button>
    </div>
  )
}

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [tokenState, setTokenState] = useState<TokenState>(token ? 'verifying' : 'invalid')
  const [formError, setFormError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenState('invalid')
      return
    }

    let cancelled = false
    verifyResetPasswordToken(token)
      .then(() => {
        if (!cancelled) setTokenState('valid')
      })
      .catch(() => {
        if (!cancelled) setTokenState('invalid')
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return
    setFormError(null)
    try {
      await resetPassword(token, values)
      setIsComplete(true)
    } catch (error) {
      setFormError(
        error instanceof InvalidResetTokenError
          ? error.message
          : 'Something went wrong resetting your password. Please try again.'
      )
      if (error instanceof InvalidResetTokenError) {
        setTokenState('invalid')
      }
    }
  }

  if (tokenState === 'verifying') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verifying your link…</p>
      </div>
    )
  }

  if (tokenState === 'invalid') {
    return <InvalidTokenNotice />
  }

  if (isComplete) {
    return <ResetPasswordSuccess />
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Set a new password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your organization account.</p>
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

        <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message}>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.newPassword}
            className="h-10"
            {...register('newPassword')}
          />
        </FormField>

        <FormField label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            className="h-10"
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="h-10">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Resetting password…
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </div>
  )
}
