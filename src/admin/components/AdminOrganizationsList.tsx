import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { OrganizationStatusBadge } from '@/organizations/components/OrganizationStatusBadge'
import { OrganizationStatusActions } from '@/admin/components/OrganizationStatusActions'
import { listAllOrganizations } from '@/admin/api/adminApi'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import type { Organization, OrganizationStatus } from '@/organizations/types/organization'

type FilterValue = OrganizationStatus | 'ALL'

const FILTERS: Array<{ label: string; value: FilterValue }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
]

export function AdminOrganizationsList() {
  const [organizations, setOrganizations] = useState<Organization[] | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>('ALL')

  useEffect(() => {
    let cancelled = false
    listAllOrganizations().then((data) => {
      if (!cancelled) setOrganizations(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function handleStatusChange(id: string, status: OrganizationStatus) {
    setOrganizations((prev) =>
      prev ? prev.map((org) => (org.id === id ? { ...org, status } : org)) : prev
    )
  }

  const filtered = useMemo(() => {
    if (!organizations) return []
    const q = query.trim().toLowerCase()
    return organizations.filter((org) => {
      const matchesQuery =
        !q ||
        org.name.toLowerCase().includes(q) ||
        org.email.toLowerCase().includes(q) ||
        org.taxRegistrationNumber.includes(q)
      const matchesFilter = filter === 'ALL' || org.status === filter
      return matchesQuery && matchesFilter
    })
  }, [organizations, query, filter])

  const pendingCount = organizations?.filter((org) => org.status === 'PENDING').length ?? 0

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Organizations
          </h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? 'registration is' : 'registrations are'} waiting for review.`
              : 'Every registration has been reviewed.'}
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, or tax number…"
            className="h-10 w-full pl-9 sm:w-72 md:w-80"
          />
        </div>
      </div>

      {organizations === null ? (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          No organizations have registered yet.
        </div>
      ) : (
        <>
          <div className="flex w-fit items-center gap-1 rounded-lg bg-secondary p-1">
            {FILTERS.map((item) => {
              const count =
                item.value === 'ALL'
                  ? organizations.length
                  : organizations.filter((org) => org.status === item.value).length
              const isActive = filter === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                  <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
                </button>
              )
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
              No organizations match this view.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card ring-1 ring-foreground/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Organization
                    </th>
                    <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Tax registration
                    </th>
                    <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      Requested
                    </th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((organization) => (
                    <tr key={organization.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <Link
                          to={`/admin/organizations/${organization.id}`}
                          className="flex flex-col gap-0.5"
                        >
                          <span className="font-medium text-foreground hover:text-primary hover:underline">
                            {organization.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {organization.email}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-foreground">
                          {organization.taxRegistrationNumber}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="size-3 shrink-0" />
                          <span className="max-w-40 truncate">
                            {organization.taxRegistrationDocument}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <OrganizationStatusBadge status={organization.status} />
                      </td>
                      <td className="px-5 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                        {formatRelativeTime(organization.requestedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <OrganizationStatusActions
                          organization={organization}
                          onStatusChange={handleStatusChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
