import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { LinkedInSignupForm } from '@/organizations/components/LinkedInSignupForm'
import { RegistrationSuccess } from '@/organizations/components/RegistrationSuccess'
import type { RegisterOrganizationResult } from '@/organizations/api/organizationsApi'

/**
 * Lands here from `authentication-service`'s own server-side redirect after
 * LinkedIn OAuth completes (`OrganizationController.linkedinCallback` →
 * `sendRedirect(frontendUrl + "/signup/linkedin?token=" + signupToken)`) —
 * this page never talks to LinkedIn directly, it only reads the `token`
 * query param the backend already resolved a LinkedIn profile against.
 */
export function LinkedInSignupPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [result, setResult] = useState<RegisterOrganizationResult | null>(null)

  if (!token) {
    return (
      <AuthLayout
        eyebrow="Register"
        title="This sign-up link is missing its token."
        description="Start over from the registration page and choose Continue with LinkedIn again."
        contentClassName="max-w-md"
      >
        <Link to="/register" className="font-medium text-primary hover:underline">
          Back to registration
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Register"
      title="Almost done — verify your organization."
      description="We've got your name and email from LinkedIn. Just add your organization details and tax registration document for review."
      contentClassName="max-w-md"
      footer={
        result ? undefined : (
          <p className="text-center text-sm text-muted-foreground">
            Already approved?{' '}
            <Link to="/login" replace className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        )
      }
    >
      {result ? <RegistrationSuccess result={result} /> : <LinkedInSignupForm token={token} onSuccess={setResult} />}
    </AuthLayout>
  )
}
