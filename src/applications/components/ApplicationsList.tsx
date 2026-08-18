import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ApplicationsTable } from '@/applications/components/ApplicationsTable'
import { ApplicationsTableSkeleton } from '@/applications/components/ApplicationsTableSkeleton'
import { ResumePreviewModal } from '@/applications/components/ResumePreviewModal'
import { OrganizationOnlyMessage, RestrictedSection } from '@/dashboard/components/RestrictedSection'
import { useCurrentAccount } from '@/auth/context/AccountContext'
import { listCandidates } from '@/candidates/api/candidatesApi'
import { listJobs } from '@/jobs/api/jobsApi'
import type { Candidate } from '@/candidates/types/candidate'

export function ApplicationsList() {
  const account = useCurrentAccount()
  const [candidates, setCandidates] = useState<Candidate[] | null>(null)
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([listCandidates(), listJobs()]).then(([candidateData, jobs]) => {
      if (cancelled) return
      setCandidates(candidateData)
      setJobTitles(Object.fromEntries(jobs.map((job) => [job.id, job.title])))
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Every application returned by `listCandidates()` came through the public
  // job board — there's no other way to create one now that the backend is
  // real — so, unlike the mock, no `appliedJobId` filter is needed here.
  const applications = candidates ?? []

  const filteredApplications = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return candidates ?? []
    return (candidates ?? []).filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(q) || candidate.email.toLowerCase().includes(q)
    )
  }, [candidates, query])

  if (account?.type === 'organization') {
    return (
      <RestrictedSection
        title="Applications is for your team, not the organization account"
        description={<OrganizationOnlyMessage section="Applications" />}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Applications
        </h1>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, or job…"
            className="h-10 w-full pl-9 sm:w-64 md:w-80"
          />
        </div>
      </div>

      {candidates === null ? (
        <ApplicationsTableSkeleton />
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          No applications yet — they'll show up here as candidates apply on the{' '}
          <a href="/jobs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            public job board
          </a>
          .
        </div>
      ) : (
        <>
          <p className="font-mono text-xs text-muted-foreground">
            {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
          </p>
          <ApplicationsTable
            applications={filteredApplications}
            jobTitles={jobTitles}
            onPreviewResume={setPreviewCandidate}
          />
        </>
      )}

      <ResumePreviewModal
        candidate={previewCandidate}
        onOpenChange={(open) => !open && setPreviewCandidate(null)}
      />
    </div>
  )
}
