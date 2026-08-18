import type { OrganizationStatus } from '@/organizations/types/organization'

interface OrganizationStatusConfig {
  label: string
  text: string
  bg: string
  dot: string
}

/**
 * Maps the `organizations.status` enum onto the semantic status tokens. Shared
 * by every surface that shows organization status (profile card, dashboard
 * overview pill, admin console) so they can't drift apart.
 */
export const ORGANIZATION_STATUS_CONFIG: Record<OrganizationStatus, OrganizationStatusConfig> = {
  PENDING: { label: 'Pending review', text: 'text-pending', bg: 'bg-pending/10', dot: 'bg-pending' },
  ACCEPTED: { label: 'Approved', text: 'text-approved', bg: 'bg-approved/10', dot: 'bg-approved' },
  REJECTED: {
    label: 'Rejected',
    text: 'text-destructive',
    bg: 'bg-destructive/10',
    dot: 'bg-destructive',
  },
}
