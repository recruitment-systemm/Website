import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Search, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { InterviewCandidateCard } from '@/interviews/components/InterviewCandidateCard'
import { ScheduleInterviewModal } from '@/interviews/components/ScheduleInterviewModal'
import { RecordOutcomeModal } from '@/interviews/components/RecordOutcomeModal'
import { OrganizationOnlyMessage, RestrictedSection } from '@/dashboard/components/RestrictedSection'
import { useCurrentAccount } from '@/auth/context/AccountContext'
import {
  cancelInterview,
  listInterviewCandidates,
  recordRoundOutcome,
  type InterviewCandidate,
} from '@/interviews/api/interviewsApi'
import type { Interview, InterviewRound } from '@/interviews/types/interview'

interface Notice {
  name: string
  movedTo: 'HIRED' | 'REJECTED'
}

interface SchedulingTarget {
  candidateId: string
  candidateName: string
  round: InterviewRound
}

interface RecordingTarget {
  candidateId: string
  candidateName: string
  round: InterviewRound
  outcome: 'PASSED' | 'FAILED'
}

export function InterviewsList() {
  const account = useCurrentAccount()
  const [items, setItems] = useState<InterviewCandidate[] | null>(null)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState<{ candidateId: string; round: InterviewRound } | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [scheduling, setScheduling] = useState<SchedulingTarget | null>(null)
  const [recording, setRecording] = useState<RecordingTarget | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listInterviewCandidates().then((data) => {
      if (!cancelled) setItems(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function handleSchedule(candidateId: string, round: InterviewRound) {
    const item = items?.find((entry) => entry.candidate.id === candidateId)
    if (!item) return
    setScheduling({ candidateId, candidateName: item.candidate.name, round })
  }

  function handleScheduled(interview: Interview) {
    setItems(
      (prev) =>
        prev?.map((entry) =>
          entry.candidate.id === interview.applicationId
            ? { ...entry, interviews: [...entry.interviews, interview] }
            : entry
        ) ?? prev
    )
  }

  async function handleCancel(candidateId: string, interview: Interview) {
    setActionError(null)
    setBusy({ candidateId, round: interview.phase })
    try {
      const cancelled = await cancelInterview(interview.id)
      setItems(
        (prev) =>
          prev?.map((entry) =>
            entry.candidate.id === candidateId
              ? {
                  ...entry,
                  interviews: entry.interviews.map((item) => (item.id === cancelled.id ? cancelled : item)),
                }
              : entry
          ) ?? prev
      )
    } catch {
      // Only SCHEDULED interviews can be cancelled — if someone else already
      // completed or cancelled it since this page loaded, refetch so the
      // card reflects reality instead of leaving a stale "Cancel" button.
      setActionError("Couldn't cancel that interview — refreshing.")
      setItems(await listInterviewCandidates())
    } finally {
      setBusy(null)
    }
  }

  function handleRecord(candidateId: string, round: InterviewRound, outcome: 'PASSED' | 'FAILED') {
    const item = items?.find((entry) => entry.candidate.id === candidateId)
    if (!item) return
    setRecording({ candidateId, candidateName: item.candidate.name, round, outcome })
  }

  async function confirmRecord(notes: string) {
    if (!recording) return
    const { candidateId, round, outcome } = recording
    const item = items?.find((entry) => entry.candidate.id === candidateId)
    if (!item) return

    setBusy({ candidateId, round })
    try {
      const result = await recordRoundOutcome(item.interviews, round, outcome, notes)
      setRecording(null)

      if (result.movedTo) {
        // They've left the Interview stage, so drop them from this page and
        // say where they went — otherwise the row would just vanish.
        setItems((prev) => prev?.filter((entry) => entry.candidate.id !== candidateId) ?? prev)
        setNotice({ name: item.candidate.name, movedTo: result.movedTo })
      } else {
        // Refetch so the newly-decided round's state is authoritative — same
        // convention used everywhere the backend is the source of truth.
        setItems(await listInterviewCandidates())
      }
    } finally {
      setBusy(null)
    }
  }

  const q = query.trim().toLowerCase()
  const filtered = (items ?? []).filter(
    (item) =>
      !q ||
      item.candidate.name.toLowerCase().includes(q) ||
      item.candidate.email.toLowerCase().includes(q)
  )

  if (account?.type === 'organization') {
    return (
      <RestrictedSection
        title="Interviews is for your team, not the organization account"
        description={<OrganizationOnlyMessage section="Interviews" />}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Interviews
          </h1>
          <p className="text-sm text-muted-foreground">
            Everyone in the Interview stage, and where they are in the process.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or email…"
            className="h-10 w-full pl-9 sm:w-64 md:w-80"
          />
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {actionError}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className={cn(
            'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
            notice.movedTo === 'HIRED'
              ? 'border-approved/30 bg-approved/5 text-approved'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          )}
        >
          <span className="flex items-center gap-2">
            {notice.movedTo === 'HIRED' ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <XCircle className="size-4 shrink-0" />
            )}
            {notice.movedTo === 'HIRED'
              ? `${notice.name} cleared every round and moved to Hired.`
              : `${notice.name} didn’t pass and moved to Rejected.`}
          </span>
          <Link
            to="/dashboard/candidates"
            className="shrink-0 font-medium underline underline-offset-2"
          >
            View board
          </Link>
        </div>
      )}

      {items === null ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          Nobody is interviewing right now. Move a candidate into the Interview
          column on the{' '}
          <Link to="/dashboard/candidates" className="text-primary hover:underline">
            Candidates board
          </Link>{' '}
          to start their rounds.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          No interviewing candidates match your search.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((item) => (
            <InterviewCandidateCard
              key={item.candidate.id}
              item={item}
              busyRound={busy?.candidateId === item.candidate.id ? busy.round : null}
              onSchedule={handleSchedule}
              onCancel={handleCancel}
              onRecord={handleRecord}
            />
          ))}
        </div>
      )}

      {scheduling && (
        <ScheduleInterviewModal
          open
          onOpenChange={(open) => {
            if (!open) setScheduling(null)
          }}
          candidateName={scheduling.candidateName}
          applicationId={scheduling.candidateId}
          round={scheduling.round}
          onScheduled={(interview) => {
            handleScheduled(interview)
            setScheduling(null)
          }}
        />
      )}

      {recording && (
        <RecordOutcomeModal
          open
          onOpenChange={(open) => {
            if (!open) setRecording(null)
          }}
          candidateName={recording.candidateName}
          round={recording.round}
          outcome={recording.outcome}
          isSubmitting={busy?.candidateId === recording.candidateId && busy.round === recording.round}
          onConfirm={confirmRecord}
        />
      )}
    </div>
  )
}
