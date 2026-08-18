import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Loader2, Mail, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { getCurrentOrganization } from '@/organizations/api/organizationsApi'
import { logout } from '@/auth/api/authApi'
import { siteConfig } from '@/shared/config/site'
import type { Organization } from '@/organizations/types/organization'

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoDate))
}

/**
 * Where `RequireOrganization` sends organizations an administrator has
 * rejected. Kept separate from `PendingApprovalPage` because the two are
 * different messages, not two states of one: pending is "wait", rejected is a
 * decision with no in-app path forward. Showing a three-step progress tracker
 * here would imply the process is still moving, which it isn't.
 */
export function RegistrationRejectedPage() {
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
  // A rejection can be reversed from the admin console, so don't strand an org
  // here once its status has moved on.
  if (organization.status === 'ACCEPTED') return <Navigate to="/dashboard" replace />
  if (organization.status === 'PENDING') return <Navigate to="/pending-approval" replace />

  return (
    <AuthLayout
      eyebrow="Registration declined"
      title="This organization wasn’t approved."
      description="Every organization is verified against its tax registration documents before it can hire on HireDesk."
      contentClassName="max-w-md"
    >
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="size-5" />
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {organization.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            An administrator reviewed this registration on{' '}
            {formatDate(organization.requestedAt)} and didn’t approve it, so the
            dashboard isn’t available.
          </p>
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-5">
          <p className="font-mono text-[11px] tracking-wide text-destructive uppercase">
            What you can do
          </p>
          <ul className="mt-2.5 flex list-disc flex-col gap-1.5 pl-4 text-sm text-muted-foreground">
            <li>
              Check that the tax registration number and document you submitted
              match your registered company details.
            </li>
            <li>Ask our team to take another look if you think this is a mistake.</li>
          </ul>

          <Button asChild variant="outline" className="mt-4 h-9 w-full">
            <a
              href={`mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(
                `Registration review: ${organization.name}`
              )}`}
            >
              <Mail className="size-4" />
              Contact support
            </a>
          </Button>
        </div>

        <Button variant="ghost" className="h-10" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </AuthLayout>
  )
}
