import { useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setOrganizationStatus } from '@/admin/api/adminApi'
import type { Organization, OrganizationStatus } from '@/organizations/types/organization'

interface OrganizationStatusActionsProps {
  organization: Organization
  onStatusChange: (id: string, status: OrganizationStatus) => void
}

/**
 * The approve/reject controls — only shown for `PENDING` organizations.
 *
 * The backend's status lifecycle is a strict one-shot decision:
 * `OrganizationService.updateStatus` requires the organization's *current*
 * status to be `PENDING` (rejects with 409 otherwise, "Organization status
 * has already been decided") and only accepts `ACCEPTED`/`REJECTED` as a
 * target — there is no code path anywhere that reverses an already-decided
 * organization back to `PENDING`, or between `ACCEPTED`/`REJECTED`. An
 * earlier version of this component offered "Revoke access," "Approve
 * instead," and "Move back to review" for already-decided orgs — all three
 * would have 409'd unconditionally, since the backend has no reversal path
 * at all. Once decided, status is simply not actionable from this console.
 */
export function OrganizationStatusActions({
  organization,
  onStatusChange,
}: OrganizationStatusActionsProps) {
  const [pendingStatus, setPendingStatus] = useState<OrganizationStatus | null>(null)

  async function apply(status: OrganizationStatus) {
    setPendingStatus(status)
    try {
      await setOrganizationStatus(organization.id, status)
      onStatusChange(organization.id, status)
    } finally {
      setPendingStatus(null)
    }
  }

  const isBusy = pendingStatus !== null

  if (organization.status !== 'PENDING') return null

  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" className="h-8" disabled={isBusy} onClick={() => apply('ACCEPTED')}>
        {pendingStatus === 'ACCEPTED' ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5" />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-destructive hover:text-destructive"
        disabled={isBusy}
        onClick={() => apply('REJECTED')}
      >
        {pendingStatus === 'REJECTED' ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <X className="size-3.5" />
        )}
        Reject
      </Button>
    </div>
  )
}
