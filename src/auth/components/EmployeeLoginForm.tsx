import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/FormField'
import { employeeLoginSchema, type EmployeeLoginFormValues } from '@/auth/validation/employeeLoginSchema'
import { employeeLogin } from '@/auth/api/authApi'

export function EmployeeLoginForm() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeLoginFormValues>({
    resolver: zodResolver(employeeLoginSchema),
    defaultValues: { email: '', username: '', password: '' },
  })

  async function onSubmit(values: EmployeeLoginFormValues) {
    setFormError(null)
    try {
      await employeeLogin(values)
      navigate('/dashboard')
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We couldn't sign you in. Check your details and try again."
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

      <FormField label="Work email" htmlFor="employee-email" error={errors.email?.message}>
        <Input
          id="employee-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={!!errors.email}
          className="h-10"
          {...register('email')}
        />
      </FormField>

      <FormField label="Username" htmlFor="employee-username" error={errors.username?.message}>
        <Input
          id="employee-username"
          type="text"
          autoComplete="username"
          aria-invalid={!!errors.username}
          className="h-10"
          {...register('username')}
        />
      </FormField>

      <FormField label="Password" htmlFor="employee-password" error={errors.password?.message}>
        <Input
          id="employee-password"
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
