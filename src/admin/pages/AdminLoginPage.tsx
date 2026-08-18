import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/FormField'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { loginSchema, type LoginFormValues } from '@/auth/validation/loginSchema'
import { adminLogin } from '@/admin/api/adminApi'

export function AdminLoginPage() {
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
      await adminLogin(values.email, values.password)
      navigate('/admin', { replace: true })
    } catch {
      setFormError('Those administrator credentials weren’t recognised.')
    }
  }

  return (
    <AuthLayout
      eyebrow="Administrator"
      title="Review and approve the organizations on HireDesk."
      description="Administrators verify tax registration documents before an organization can start hiring."
      contentClassName="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div>
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Admin sign in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This is the platform console, not an organization account.
          </p>
        </div>

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
            placeholder="admin@hiredesk.app"
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
            'Sign in as admin'
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
