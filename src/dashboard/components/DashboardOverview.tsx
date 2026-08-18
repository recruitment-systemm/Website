import { useEffect, useState } from 'react'
import { Briefcase, Building2, Info, Trophy, Users } from 'lucide-react'
import { StatCard } from '@/dashboard/components/StatCard'
import { PipelineSummary } from '@/dashboard/components/PipelineSummary'
import { RecentJobsCard } from '@/dashboard/components/RecentJobsCard'
import { RecentCandidatesCard } from '@/dashboard/components/RecentCandidatesCard'
import { DashboardOverviewSkeleton } from '@/dashboard/components/DashboardOverviewSkeleton'
import { useCurrentAccount } from '@/auth/context/AccountContext'
import { listJobs } from '@/jobs/api/jobsApi'
import { listCandidates } from '@/candidates/api/candidatesApi'
import { listOrganizationUsers } from '@/users/api/usersApi'
import { OrganizationStatusBadge } from '@/organizations/components/OrganizationStatusBadge'
import type { Job } from '@/jobs/types/job'
import type { Candidate } from '@/candidates/types/candidate'
import type { OrgUser } from '@/users/types/user'

interface PipelineData {
  jobs: Job[]
  candidates: Candidate[]
  users: OrgUser[]
}

/**
 * job-service and Application-Interview-Services both require an employee
 * JWT (organizationId + role claims) — an organization session has neither,
 * so `listJobs()`/`listCandidates()` always resolve to `[]` for one, same
 * as for an employee session hitting the org-only endpoints the other way
 * round. Rather than silently show all-zero stat cards either way, this
 * page composes only what the signed-in account type can actually see and
 * says so for the rest.
 */
export function DashboardOverview() {
  const account = useCurrentAccount()
  const [pipeline, setPipeline] = useState<PipelineData | null>(null)

  const isOrganization = account?.type === 'organization'
  const isEmployee = account?.type === 'employee'

  useEffect(() => {
    let cancelled = false
    Promise.all([listJobs(), listCandidates(), listOrganizationUsers()]).then(
      ([jobs, candidates, users]) => {
        if (!cancelled) setPipeline({ jobs, candidates, users })
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  if (account === undefined || !pipeline) {
    return <DashboardOverviewSkeleton />
  }

  const { jobs, candidates, users } = pipeline
  const openJobs = jobs.filter((job) => job.status === 'OPEN').length
  const activeCandidates = candidates.filter(
    (candidate) => candidate.stage !== 'HIRED' && candidate.stage !== 'REJECTED'
  ).length
  const hires = candidates.filter((candidate) => candidate.stage === 'HIRED').length

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          {isOrganization && (
            <p className="text-sm text-muted-foreground">
              Here's your organization's status. Hiring activity is visible to your HR and
              Interviewer team, not the organization account.
            </p>
          )}
          {isEmployee && (
            <p className="text-sm text-muted-foreground">Here's what's happening in the pipeline today.</p>
          )}
        </div>
        {isOrganization && <OrganizationStatusBadge status={account.organization.status} className="w-fit" />}
      </div>

      {isOrganization ? (
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Jobs, candidates, applications, and interviews are only visible when signed in as an HR
          or Interviewer teammate — invite one from the Organization page if you haven't yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Open jobs" value={openJobs} icon={Briefcase} hint={`${jobs.length} total`} />
          <StatCard
            label="Active candidates"
            value={activeCandidates}
            icon={Users}
            hint={`${candidates.length} total`}
          />
          <StatCard label="Hires" value={hires} icon={Trophy} accent="approved" hint="all time" />
          <StatCard label="Team members" value={users.length} icon={Building2} hint="HR + Interviewers" />
        </div>
      )}

      {!isOrganization && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PipelineSummary candidates={candidates} />
            <RecentJobsCard jobs={jobs} />
          </div>

          <RecentCandidatesCard candidates={candidates} />
        </>
      )}
    </div>
  )
}
