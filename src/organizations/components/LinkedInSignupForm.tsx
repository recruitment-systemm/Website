import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/FormField'
import { TaxVerificationFields } from '@/organizations/components/TaxVerificationFields'
import {
  linkedinSignupSchema,
  type LinkedInSignupFormValues,
} from '@/organizations/validation/linkedinSignupSchema'
import {
  completeLinkedInSignup,
  EmailAlreadyRegisteredError,
  InvalidLinkedInSignupTokenError,
  type RegisterOrganizationResult,
} from '@/organizations/api/organizationsApi'

interface LinkedInSignupFormProps {
  token: string
  onSuccess: (result: RegisterOrganizationResult) => void
}

/**
 * Completes an organization signup after LinkedIn OAuth. The backend
 * already knows the person's name/email from LinkedIn (stashed server-side
 * against `token`, see `LinkedInSignupService`) — this form only collects
 * what LinkedIn doesn't provide: the *organization's* name (not the
 * individual's), a password for future email/password sign-in, and tax
 * verification, identical to the plain registration form's second step.
 */
export function LinkedInSignupForm({ token, onSuccess }: LinkedInSignupFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LinkedInSignupFormValues>({
    resolver: zodResolver(linkedinSignupSchema),
    defaultValues: {
      organizationName: '',
      password: '',
      confirmPassword: '',
      taxRegistrationNumber: '',
      taxRegistrationDocument: undefined,
    },
  })

  async function onSubmit(values: LinkedInSignupFormValues) {
    setFormError(null)
    try {
      const result = await completeLinkedInSignup({
        token,
        organizationName: values.organizationName,
        password: values.password,
        taxRegistrationNumber: values.taxRegistrationNumber,
        taxRegistrationDocument: values.taxRegistrationDocument as File,
      })
      onSuccess(result)
    } catch (error) {
      if (error instanceof EmailAlreadyRegisteredError) {
        setFormError('An organization is already registered with that LinkedIn email. Try signing in instead.')
        return
      }
      if (error instanceof InvalidLinkedInSignupTokenError) {
        setFormError(error.message)
        return
      }
      setFormError('Something went wrong submitting your registration. Please try again.')
    }
  }

  return (
    <div>
      {formError && (
        <div
          role="alert"
          className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <FormField
          label="Organization name"
          htmlFor="organizationName"
          error={errors.organizationName?.message}
        >
          <Input
            id="organizationName"
            autoComplete="organization"
            placeholder="Acme Recruiting Ltd."
            aria-invalid={!!errors.organizationName}
            className="h-10"
            {...register('organizationName')}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint={!errors.password ? "You'll use this to sign in directly next time." : undefined}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            className="h-10"
            {...register('password')}
          />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
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

        <TaxVerificationFields
          control={control}
          taxNumberName="taxRegistrationNumber"
          taxDocumentName="taxRegistrationDocument"
        />

        <Button type="submit" disabled={isSubmitting} className="h-10">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting…
            </>
          ) : (
            'Submit for review'
          )}
        </Button>
      </form>
    </div>
  )
}
