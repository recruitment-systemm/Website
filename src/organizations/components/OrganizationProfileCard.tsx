import { Building2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrganizationStatusBadge } from '@/organizations/components/OrganizationStatusBadge'
import type { Organization } from '@/organizations/types/organization'

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(
    new Date(isoDate)
  )
}

interface OrganizationProfileCardProps {
  organization: Organization
}

export function OrganizationProfileCard({ organization }: OrganizationProfileCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card ring-1 ring-foreground/5">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </span>
          <div>
            <p className="font-heading text-base font-semibold text-foreground">{organization.name}</p>
            <p className="text-sm text-muted-foreground">{organization.email}</p>
          </div>
        </div>
        <OrganizationStatusBadge status={organization.status} />
      </div>

      <dl className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Tax registration number
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {organization.taxRegistrationNumber}
          </dd>
        </div>

        <div>
          <dt className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Tax document
          </dt>
          <dd className="mt-1">
            <Button asChild variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-xs">
              <a href={organization.taxRegistrationDocument} target="_blank" rel="noopener noreferrer">
                <FileText className="size-3.5" />
                View document
              </a>
            </Button>
          </dd>
        </div>

        <div>
          <dt className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Member since
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {formatDate(organization.requestedAt)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
