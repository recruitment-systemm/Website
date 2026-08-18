import { Link } from 'react-router-dom'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { LoginForm } from '@/auth/components/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Pick up right where your team left off."
      description="Approved organizations can sign in to manage jobs, invite teammates, and review applications."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Registering a new organization?{' '}
          <Link to="/register" replace className="font-medium text-primary hover:underline">
            Submit your company for review
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
