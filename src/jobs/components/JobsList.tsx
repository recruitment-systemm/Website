import { useEffect, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreateJobModal } from '@/jobs/components/CreateJobModal'
import { JobsTable } from '@/jobs/components/JobsTable'
import { JobsTableSkeleton } from '@/jobs/components/JobsTableSkeleton'
import { HrOnlyMessage, OrganizationOnlyMessage, RestrictedSection } from '@/dashboard/components/RestrictedSection'
import { useCurrentAccount } from '@/auth/context/AccountContext'
import { listJobs, updateJobStatus } from '@/jobs/api/jobsApi'
import type { Job, JobStatus } from '@/jobs/types/job'
import { cn } from '@/lib/utils'

type FilterValue = JobStatus | 'ALL'

const FILTERS: Array<{ label: string; value: FilterValue }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Closed', value: 'CLOSED' },
]

export function JobsList() {
  const account = useCurrentAccount()
  const [jobs, setJobs] = useState<Job[] | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>('ALL')
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    listJobs().then((data) => {
      if (!cancelled) setJobs(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function handleStatusChange(jobId: string, status: JobStatus) {
    setJobs((prev) => (prev ? prev.map((job) => (job.id === jobId ? { ...job, status } : job)) : prev))
    void updateJobStatus(jobId, status)
  }

  function handleJobCreated(job: Job) {
    setJobs((prev) => (prev ? [job, ...prev] : [job]))
    setFilter('ALL')
  }

  const filteredJobs = useMemo(() => {
    if (!jobs) return []
    const q = query.trim().toLowerCase()
    return jobs.filter((job) => {
      const matchesQuery =
        !q || job.title.toLowerCase().includes(q) || job.address.toLowerCase().includes(q)
      const matchesFilter = filter === 'ALL' || job.status === filter
      return matchesQuery && matchesFilter
    })
  }, [jobs, query, filter])

  if (account?.type === 'organization') {
    return (
      <RestrictedSection
        title="Jobs is for your team, not the organization account"
        description={<OrganizationOnlyMessage section="Jobs" />}
      />
    )
  }

  if (account?.type === 'employee' && account.employee.role === 'INTERVIEWER') {
    return (
      <RestrictedSection
        title="Jobs is an HR section"
        description={<HrOnlyMessage section="Jobs" />}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">Jobs</h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or location…"
              className="h-10 w-full pl-9 sm:w-64 md:w-80"
            />
          </div>

          <Button className="h-10 w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create Job
          </Button>
        </div>
      </div>

      <CreateJobModal open={createOpen} onOpenChange={setCreateOpen} onCreated={handleJobCreated} />

      {jobs === null ? (
        <JobsTableSkeleton />
      ) : (
        <>
          <div className="flex w-fit items-center gap-1 rounded-lg bg-secondary p-1">
            {FILTERS.map((item) => {
              const count =
                item.value === 'ALL'
                  ? jobs.length
                  : jobs.filter((job) => job.status === item.value).length
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

          <JobsTable jobs={filteredJobs} onStatusChange={handleStatusChange} />
        </>
      )}
    </div>
  )
}
