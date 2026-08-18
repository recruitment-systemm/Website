import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/shared/components/FormField'
import { RegistrationProgress } from '@/organizations/components/RegistrationProgress'
import { TaxVerificationFields } from '@/organizations/components/TaxVerificationFields'
import { LinkedInSignupButton } from '@/organizations/components/LinkedInSignupButton'
import {
  companyDetailsFieldNames,
  registerOrganizationSchema,
  type RegisterOrganizationFormValues,
} from '@/organizations/validation/registerOrganizationSchema'
import {
  EmailAlreadyRegisteredError,
  registerOrganization,
  type RegisterOrganizationResult,
} from '@/organizations/api/organizationsApi'

interface RegisterOrganizationFormProps {
  onSuccess: (result: RegisterOrganizationResult) => void
}

export function RegisterOrganizationForm({ onSuccess }: RegisterOrganizationFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterOrganizationFormValues>({
    resolver: zodResolver(registerOrganizationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      taxRegistrationNumber: '',
      taxRegistrationDocument: undefined,
    },
  })

  async function handleContinue() {
    const isStepValid = await trigger(companyDetailsFieldNames)
    if (isStepValid) setStep(2)
  }

  async function onSubmit(values: RegisterOrganizationFormValues) {
    setFormError(null)
    try {
      const result = await registerOrganization({
        name: values.name,
        email: values.email,
        password: values.password,
        taxRegistrationNumber: values.taxRegistrationNumber,
        taxRegistrationDocument: values.taxRegistrationDocument as File,
      })
      onSuccess(result)
    } catch (error) {
      if (error instanceof EmailAlreadyRegisteredError) {
        // Send them back to step 1 so the offending email field is visible.
        setStep(1)
        setFormError('An organization is already registered with that email. Try signing in instead.')
        return
      }
      setFormError('Something went wrong submitting your registration. Please try again.')
    }
  }

  return (
    <div>
      <RegistrationProgress currentStep={step} />

      {formError && (
        <div
          role="alert"
          className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {step === 1 && (
          <>
            <LinkedInSignupButton />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or register with email
              <div className="h-px flex-1 bg-border" />
            </div>

            <FormField label="Organization name" htmlFor="name" error={errors.name?.message}>
              <Input
                id="name"
                autoComplete="organization"
                placeholder="Acme Recruiting Ltd."
                aria-invalid={!!errors.name}
                className="h-10"
                {...register('name')}
              />
            </FormField>

            <FormField label="Work email" htmlFor="email" error={errors.email?.message}>
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

            <FormField
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
              hint={!errors.password ? 'At least 8 characters, including a number.' : undefined}
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

            <FormField
              label="Confirm password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
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

            <Button type="button" onClick={handleContinue} className="h-10">
              Continue to tax verification
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <TaxVerificationFields
              control={control}
              taxNumberName="taxRegistrationNumber"
              taxDocumentName="taxRegistrationDocument"
            />

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="h-10" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-10 flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit for review'
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
