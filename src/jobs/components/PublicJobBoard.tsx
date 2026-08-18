import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ApplyToJobModal } from '@/jobs/components/ApplyToJobModal'
import { PublicJobCard } from '@/jobs/components/PublicJobCard'
import { listPublicJobs } from '@/jobs/api/jobsApi'
import type { Job } from '@/jobs/types/job'

export function PublicJobBoard() {
  const [jobs, setJobs] = useState<Job[] | null>(null)
  const [query, setQuery] = useState('')
  const [applyingTo, setApplyingTo] = useState<Job | null>(null)

  useEffect(() => {
    let cancelled = false
    listPublicJobs().then((data) => {
      if (!cancelled) setJobs(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredJobs = useMemo(() => {
    if (!jobs) return []
    const q = query.trim().toLowerCase()
    if (!q) return jobs
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.address.toLowerCase().includes(q) ||
        (job.organizationName ?? '').toLowerCase().includes(q)
    )
  }, [jobs, query])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Open positions
        </h1>
        <p className="text-muted-foreground">
          Browse open roles across every organization hiring on HireDesk. No account needed to
          apply.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, company, or location…"
          className="h-11 w-full max-w-md pl-9"
        />
      </div>

      {jobs === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          No open positions match your search right now.
        </div>
      ) : (
        <>
          <p className="font-mono text-xs text-muted-foreground">
            {filteredJobs.length} open {filteredJobs.length === 1 ? 'position' : 'positions'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <PublicJobCard key={job.id} job={job} onApply={setApplyingTo} />
            ))}
          </div>
        </>
      )}

      <ApplyToJobModal job={applyingTo} onOpenChange={(open) => !open && setApplyingTo(null)} />
    </div>
  )
}
