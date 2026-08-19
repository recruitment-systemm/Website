import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { ResetPasswordForm } from '@/auth/components/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password."
      description="Pick something secure that you haven't used on this account before."
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
