import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, FileText, Mail, MapPin, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { StatCard } from '@/dashboard/components/StatCard'
import { OrganizationStatusBadge } from '@/organizations/components/OrganizationStatusBadge'
import { OrganizationStatusActions } from '@/admin/components/OrganizationStatusActions'
import { CandidateAvatar } from '@/candidates/components/CandidateAvatar'
import { JobStatusBadge } from '@/jobs/components/JobStatusBadge'
import { STAGE_CONFIG } from '@/candidates/config/stageConfig'
import { getOrganizationDetail, type OrganizationDetail } from '@/admin/api/adminApi'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import type { OrganizationStatus } from '@/organizations/types/organization'

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoDate))
}

export function AdminOrganizationDetail() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const [detail, setDetail] = useState<OrganizationDetail | null | undefined>(undefined)

  useEffect(() => {
    if (!organizationId) return
    let cancelled = false
    getOrganizationDetail(organizationId).then((data) => {
      if (!cancelled) setDetail(data)
    })
    return () => {
      cancelled = true
    }
  }, [organizationId])

  function handleStatusChange(_id: string, status: OrganizationStatus) {
    setDetail((prev) =>
      prev ? { ...prev, organization: { ...prev.organization, status } } : prev
    )
  }

  if (detail === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-8 pb-10">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pt-8 pb-10">
        <BackLink />
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          That organization no longer exists.
        </div>
      </div>
    )
  }

  const { organization, jobs, candidates, employees } = detail
  const openJobs = jobs.filter((job) => job.status === 'OPEN').length
  const hires = candidates.filter((candidate) => candidate.stage === 'HIRED').length

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-8 pb-10">
      <BackLink />

      <div className="rounded-xl border border-border bg-card ring-1 ring-foreground/5">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-xl font-semibold text-foreground">
                {organization.name}
              </h1>
              <OrganizationStatusBadge status={organization.status} />
            </div>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              {organization.email}
            </span>
          </div>

          <OrganizationStatusActions
            organization={organization}
            onStatusChange={handleStatusChange}
          />
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
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <FileText className="size-3.5 shrink-0 text-muted-foreground" />
              <a
                href={organization.taxRegistrationDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-primary hover:underline"
              >
                View document
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Requested
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {formatDate(organization.requestedAt)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Jobs" value={jobs.length} icon={Briefcase} hint={`${openJobs} open`} />
        <StatCard label="Candidates" value={candidates.length} icon={Users} hint="all stages" />
        <StatCard label="Hires" value={hires} icon={Users} accent="approved" hint="all time" />
        <StatCard label="Team members" value={employees.length} icon={Users} hint="HR + interviewers" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Jobs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {jobs.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                This organization hasn’t posted any jobs.
              </p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {job.title}
                    </span>
                    <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {job.address}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <JobStatusBadge status={job.status} />
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {formatRelativeTime(job.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidates</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {candidates.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No one has applied to this organization yet.
              </p>
            ) : (
              candidates.map((candidate) => {
                const stage = STAGE_CONFIG[candidate.stage]
                return (
                  <div
                    key={candidate.id}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
                  >
                    <CandidateAvatar name={candidate.name} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium text-foreground">
                        {candidate.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {candidate.email}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-mono text-[11px] font-medium',
                          stage.badgeBg,
                          stage.text
                        )}
                      >
                        {stage.label}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatRelativeTime(candidate.appliedAt)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/admin"
      className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      All organizations
    </Link>
  )
}
