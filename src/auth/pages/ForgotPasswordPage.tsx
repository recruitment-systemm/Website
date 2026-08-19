import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { ForgotPasswordForm } from '@/auth/components/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Get back into your account."
      description="We'll email you a secure link to set a new password for your organization."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
