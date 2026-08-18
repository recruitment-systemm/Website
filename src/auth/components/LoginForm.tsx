import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/FormField'
import { loginSchema, type LoginFormValues } from '@/auth/validation/loginSchema'
import { login, OrganizationNotAcceptedError } from '@/auth/api/authApi'
import { EmployeeLoginForm } from '@/auth/components/EmployeeLoginForm'
import type { OrganizationStatus } from '@/organizations/types/organization'

type AccountKind = 'organization' | 'employee'

/** Where each approval status lands after signing in. Mirrors `RequireOrganization`. */
const STATUS_DESTINATION: Record<OrganizationStatus, string> = {
  ACCEPTED: '/dashboard',
  PENDING: '/pending-approval',
  REJECTED: '/registration-rejected',
}

function OrganizationLoginForm() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    try {
      const organization = await login(values)
      // Route on status rather than always landing on /dashboard: the guard
      // would bounce non-approved orgs anyway, and going straight to the right
      // screen avoids a visible redirect flash.
      navigate(STATUS_DESTINATION[organization.status])
    } catch (error) {
      setFormError(
        error instanceof OrganizationNotAcceptedError
          ? error.message
          : 'We couldn’t sign you in. Check your credentials and try again.'
      )
    }
  }

  return (
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

      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          className="h-10"
          {...register('password')}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting} className="h-10">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}

export function LoginForm() {
  const [accountKind, setAccountKind] = useState<AccountKind>('organization')

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Sign in
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in with your organization or team credentials.
        </p>
      </div>

      <div role="tablist" aria-label="Account type" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          role="tab"
          aria-selected={accountKind === 'organization'}
          onClick={() => setAccountKind('organization')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            accountKind === 'organization'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Organization
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={accountKind === 'employee'}
          onClick={() => setAccountKind('employee')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            accountKind === 'employee'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Team member
        </button>
      </div>

      {accountKind === 'organization' ? <OrganizationLoginForm /> : <EmployeeLoginForm />}

      <p className="text-center text-xs text-muted-foreground">
        Platform administrator?{' '}
        <Link to="/admin/login" className="font-medium text-primary hover:underline">
          Sign in to the admin console
        </Link>
      </p>
    </div>
  )
}
