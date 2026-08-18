import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { ApprovalStatusStepper } from '@/organizations/components/ApprovalStatusStepper'
import { getCurrentOrganization } from '@/organizations/api/organizationsApi'
import { logout } from '@/auth/api/authApi'
import type { Organization } from '@/organizations/types/organization'

/**
 * Where `RequireOrganization` sends organizations still awaiting review.
 * Rejections get their own screen (`RegistrationRejectedPage`) — "wait for a
 * decision" and "the decision was no" are different messages, not two states
 * of one. Approval itself happens in the admin console (`/admin`).
 */
export function PendingApprovalPage() {
  const navigate = useNavigate()
  const [organization, setOrganization] = useState<Organization | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    getCurrentOrganization().then((org) => {
      if (!cancelled) setOrganization(org)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function handleSignOut() {
    logout()
    navigate('/login', { replace: true })
  }

  if (organization === undefined) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (!organization) return <Navigate to="/login" replace />
  if (organization.status === 'ACCEPTED') return <Navigate to="/dashboard" replace />
  if (organization.status === 'REJECTED') return <Navigate to="/registration-rejected" replace />

  return (
    <AuthLayout
      eyebrow="Awaiting review"
      title="Your registration is being reviewed."
      description="Organizations get access once an administrator has verified their tax registration documents."
      contentClassName="max-w-md"
    >
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {organization.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            We’ve received your details and an administrator will review them
            within 1–2 business days. You’ll get an email at {organization.email}{' '}
            once a decision has been made.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="mb-4 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Organization status
          </p>
          <ApprovalStatusStepper status={organization.status} />
        </div>

        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground text-pretty">
          Reviewing on behalf of the platform? Decisions are made in the{' '}
          <Link to="/admin/login" className="font-medium text-primary hover:underline">
            admin console
          </Link>
          .
        </p>

        <Button variant="ghost" className="h-10" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </AuthLayout>
  )
}
