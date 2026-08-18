import { useState } from 'react'
import {
  Briefcase,
  Building2,
  CalendarClock,
  ClipboardList,
  Users,
} from 'lucide-react'
import { DockIcon, type DockItem } from '@/dashboard/components/DockIcon'
import { useCurrentAccount } from '@/auth/context/AccountContext'

interface DockItemDef extends DockItem {
  /** Which signed-in account types can actually reach this section — see
   * the per-endpoint role table below. Omitted → visible to everyone. */
  roles?: Array<'ORG' | 'HR' | 'INTERVIEWER'>
}

/**
 * Each backend endpoint this section depends on has its own role
 * requirement, so the dock only ever shows sections the signed-in account
 * can actually use — this both avoids doomed requests (see `RestrictedSection`
 * for the read-through explanation on the few paths still reachable by URL)
 * and stops the dock itself from linking to guaranteed 401s/403s/404s:
 *
 * - Organization: `GET /organizations/profile` reads the principal as an
 *   *organization* id — an employee JWT's principal is the employee's own
 *   id, so this 404s for HR/Interviewer. Org-only.
 * - Jobs: `GET /jobs/organization` is `hasRole("HR")` on job-service.
 *   Org sessions have no role claim there at all (401); INTERVIEWER gets
 *   403. HR-only.
 * - Candidates: `GET /applications` allows `hasAnyRole("HR","INTERVIEWER")`
 *   on Application-Interview-Services, but org sessions still 401 (no
 *   `organizationId`/`role` claims). HR or Interviewer.
 * - Applications: same auth as Candidates — HR or Interviewer.
 * - Interviews: same auth again — HR or Interviewer.
 */
const DOCK_ITEMS: DockItemDef[] = [
  { label: 'Organization', to: '/dashboard/organization', icon: Building2, roles: ['ORG'] },
  { label: 'Jobs', to: '/dashboard/jobs', icon: Briefcase, roles: ['HR'] },
  { label: 'Candidates', to: '/dashboard/candidates', icon: Users, roles: ['HR', 'INTERVIEWER'] },
  {
    label: 'Applications',
    to: '/dashboard/applications',
    icon: ClipboardList,
    roles: ['HR', 'INTERVIEWER'],
  },
  {
    label: 'Interviews',
    to: '/dashboard/interviews',
    icon: CalendarClock,
    roles: ['HR', 'INTERVIEWER'],
  },
]

export function DashboardDock() {
  const [mouseX, setMouseX] = useState<number | null>(null)
  const account = useCurrentAccount()

  const currentRole = account?.type === 'organization' ? 'ORG' : account?.employee.role
  // While the account check is still in flight (`account === undefined`),
  // show every item rather than nothing — a dock that briefly shows too
  // much and then narrows reads better than one that flashes empty first.
  const items =
    account === undefined ? DOCK_ITEMS : DOCK_ITEMS.filter((item) => !item.roles || item.roles.includes(currentRole!))

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
      <div
        onMouseMove={(event) => setMouseX(event.clientX)}
        onMouseLeave={() => setMouseX(null)}
        className="pointer-events-auto flex items-end gap-3 rounded-2xl border border-border bg-card/90 px-3 py-2 shadow-xl shadow-foreground/10 backdrop-blur-md"
      >
        {items.map((item) => (
          <DockIcon key={item.to} item={item} mouseX={mouseX} />
        ))}
      </div>
    </div>
  )
}
