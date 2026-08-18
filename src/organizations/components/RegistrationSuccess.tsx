import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ApprovalStatusStepper } from '@/organizations/components/ApprovalStatusStepper'
import type { RegisterOrganizationResult } from '@/organizations/api/organizationsApi'

interface RegistrationSuccessProps {
  result: RegisterOrganizationResult
}

export function RegistrationSuccess({ result }: RegistrationSuccessProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Registration submitted
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Thanks — we’ve received {result.name}’s registration. An
          administrator will review your tax documents and get back to you
          within 1–2 business days.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="mb-4 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          Organization status
        </p>
        <ApprovalStatusStepper status={result.status} />
      </div>

      <p className="text-xs text-muted-foreground">
        We’ll email your registered address once a decision has been made.
      </p>

      <div className="flex flex-col gap-2">
        <Button asChild className="h-10">
          <Link to="/login">Sign in to your account</Link>
        </Button>
        <Button asChild variant="outline" className="h-10">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
