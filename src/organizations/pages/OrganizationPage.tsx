import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { OrganizationProfileCard } from '@/organizations/components/OrganizationProfileCard'
import { getCurrentOrganization } from '@/organizations/api/organizationsApi'
import type { Organization } from '@/organizations/types/organization'
import { TeamMembersList } from '@/users/components/TeamMembersList'
import { listOrganizationUsers } from '@/users/api/usersApi'
import type { OrgUser } from '@/users/types/user'

export function OrganizationPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [users, setUsers] = useState<OrgUser[] | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getCurrentOrganization(), listOrganizationUsers()]).then(([org, orgUsers]) => {
      if (cancelled) return
      setOrganization(org)
      setUsers(orgUsers)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-10">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        Organization
      </h1>

      {organization ? (
        <OrganizationProfileCard organization={organization} />
      ) : (
        <Skeleton className="h-40 rounded-xl" />
      )}

      {users ? (
        <TeamMembersList
          users={users}
          onInvited={(user) => setUsers((prev) => [user, ...(prev ?? [])])}
        />
      ) : (
        <Skeleton className="h-64 rounded-xl" />
      )}
    </div>
  )
}
