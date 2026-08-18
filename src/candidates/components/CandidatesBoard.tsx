import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Lock, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CandidateBoardColumn } from '@/candidates/components/CandidateBoardColumn'
import { CandidateBoardSkeleton } from '@/candidates/components/CandidateBoardSkeleton'
import { CandidateCardContent } from '@/candidates/components/CandidateCardContent'
import { listCandidates, setCandidateStage } from '@/candidates/api/candidatesApi'
import { useCurrentAccount } from '@/auth/context/AccountContext'
import { LayoffReasonModal } from '@/candidates/components/LayoffReasonModal'
import { saveLayoffReason } from '@/candidates/utils/layoffReasonStore'
import { OrganizationOnlyMessage, RestrictedSection } from '@/dashboard/components/RestrictedSection'
import { CANDIDATE_STAGES, type Candidate } from '@/candidates/types/candidate'
import {
  findStage,
  groupByStage,
  isLegalStageMove,
  isStageId,
  type BoardStage,
  type CandidateBoard,
} from '@/candidates/utils/board'

interface PendingLayoff {
  candidateId: string
  candidateName: string
  revertTo: BoardStage
}

export function CandidatesBoard() {
  const account = useCurrentAccount()
  const [board, setBoard] = useState<CandidateBoard | null>(null)
  const [query, setQuery] = useState('')
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null)
  const [dragStartStage, setDragStartStage] = useState<BoardStage | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [pendingLayoff, setPendingLayoff] = useState<PendingLayoff | null>(null)

  // Application-Interview-Services' JwtAuthenticationFilter requires
  // `organizationId`/`role` claims on the token — an organization-session
  // JWT has neither, so it fails authentication there entirely (401), not
  // just authorization. And even a valid employee token needs `hasRole
  // ("HR")` specifically for `PATCH /applications/*/status` — INTERVIEWER
  // gets 403. Either way, only an HR employee session can actually move a
  // candidate, so dragging is disabled for every other account type rather
  // than letting every attempt round-trip to a guaranteed rejection.
  // `undefined` while the account check is still in flight defaults to
  // "can move" so the board isn't locked by default while loading.
  const canMoveCandidates = account === undefined || (account?.type === 'employee' && account.employee.role === 'HR')

  const isSearching = query.trim().length > 0

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    let cancelled = false
    listCandidates().then((data) => {
      if (!cancelled) setBoard(groupByStage(data))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const visibleBoard = useMemo(() => {
    if (!board) return null
    const q = query.trim().toLowerCase()
    if (!q) return board
    const result = {} as CandidateBoard
    for (const stage of CANDIDATE_STAGES) {
      result[stage] = board[stage].filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(q) || candidate.email.toLowerCase().includes(q)
      )
    }
    return result
  }, [board, query])

  function handleDragStart(event: DragStartEvent) {
    if (!board) return
    const id = event.active.id as string
    const stage = findStage(board, id)
    setActiveCandidate(stage ? (board[stage].find((c) => c.id === id) ?? null) : null)
    setDragStartStage(stage)
  }

  function handleDragOver(event: DragOverEvent) {
    if (!canMoveCandidates) return
    const { active, over } = event
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    setBoard((prev) => {
      if (!prev) return prev
      const activeStage = findStage(prev, activeId)
      const overStage = isStageId(overId) ? overId : findStage(prev, overId)
      if (!activeStage || !overStage || activeStage === overStage) return prev
      // Block the live preview for a move the backend's state machine
      // wouldn't accept — dragStartStage (not activeStage) is the real
      // origin, since a card can pass through several columns mid-drag.
      if (dragStartStage && !isLegalStageMove(dragStartStage, overStage)) return prev

      const activeItems = prev[activeStage]
      const activeIndex = activeItems.findIndex((c) => c.id === activeId)
      const activeCard = activeItems[activeIndex]
      if (!activeCard) return prev

      const overItems = prev[overStage]
      const overIndex = overItems.findIndex((c) => c.id === overId)
      const newIndex = overIndex >= 0 ? overIndex : overItems.length

      return {
        ...prev,
        [activeStage]: activeItems.filter((c) => c.id !== activeId),
        [overStage]: [
          ...overItems.slice(0, newIndex),
          { ...activeCard, stage: overStage },
          ...overItems.slice(newIndex),
        ],
      }
    })
  }

  /** Reverts an optimistically-moved card back to its origin column. */
  function revertCard(candidateId: string, destination: BoardStage, revertTo: BoardStage) {
    setBoard((current) => {
      if (!current) return current
      const card = current[destination].find((c) => c.id === candidateId)
      if (!card) return current
      return {
        ...current,
        [destination]: current[destination].filter((c) => c.id !== candidateId),
        [revertTo]: [{ ...card, stage: revertTo }, ...current[revertTo]],
      }
    })
  }

  /** Sends the real status PATCH; reverts the optimistic move on failure. */
  function commitMove(candidateId: string, destination: BoardStage, revertTo: BoardStage) {
    setCandidateStage(candidateId, destination).catch(() => {
      setMoveError(
        `Couldn't move that candidate to ${destination.replace('_', ' ').toLowerCase()} — reverted.`
      )
      revertCard(candidateId, destination, revertTo)
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCandidate(null)
    const { active, over } = event
    const activeId = active.id as string
    const overId = over ? (over.id as string) : null
    const startStage = dragStartStage
    setDragStartStage(null)

    setBoard((prev) => {
      if (!prev) return prev

      let next = prev
      const stage = findStage(prev, activeId)
      const overStage = overId ? (isStageId(overId) ? overId : findStage(prev, overId)) : null

      if (stage && overStage && stage === overStage) {
        const items = prev[stage]
        const activeIndex = items.findIndex((c) => c.id === activeId)
        const overIndex = items.findIndex((c) => c.id === overId)
        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          // A same-column reorder. The backend has no concept of "board
          // order" — only `status` — so this is local-only UI state: it's
          // never persisted and won't survive a refresh.
          next = { ...prev, [stage]: arrayMove(items, activeIndex, overIndex) }
        }
      }

      // Cross-column moves were already applied live in handleDragOver, which
      // only ever lets a card land in a column reachable via a legal
      // transition (see isLegalStageMove) — so `stage` here is always a
      // legal destination from `startStage`.
      if (stage && startStage && stage !== startStage) {
        const candidateId = activeId
        const card = next[stage].find((c) => c.id === candidateId)

        if (stage === 'LAYOFF' && card) {
          // Ask why before committing anything — the card stays visually in
          // LAYOFF (optimistic) while the modal is open; cancelling reverts
          // it, confirming fires the real PATCH plus the local-only reason.
          setPendingLayoff({ candidateId, candidateName: card.name, revertTo: startStage })
        } else {
          commitMove(candidateId, stage, startStage)
        }
      }

      return next
    })
  }

  if (account?.type === 'organization') {
    return (
      <RestrictedSection
        title="Candidates is for your team, not the organization account"
        description={<OrganizationOnlyMessage section="Candidates" />}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Candidates
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or email here…"
              className="h-10 w-full pl-9 sm:w-64 md:w-80"
            />
          </div>
        </div>
      </div>

      {moveError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {moveError}
        </div>
      )}

      {!canMoveCandidates && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
        >
          <Lock className="size-3.5 shrink-0" />
          You can view the pipeline, but only an HR team member can move candidates between stages.
        </div>
      )}

      {visibleBoard === null ? (
        <CandidateBoardSkeleton />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 items-start gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {CANDIDATE_STAGES.map((stage) => (
              <CandidateBoardColumn
                key={stage}
                stage={stage}
                candidates={visibleBoard[stage]}
                disabled={isSearching || !canMoveCandidates}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCandidate ? (
              <div className="w-72 rotate-2 rounded-xl border border-primary/30 bg-card shadow-2xl ring-1 ring-foreground/5">
                <CandidateCardContent candidate={activeCandidate} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {pendingLayoff && (
        <LayoffReasonModal
          open
          onOpenChange={(open) => {
            if (!open) {
              revertCard(pendingLayoff.candidateId, 'LAYOFF', pendingLayoff.revertTo)
              setPendingLayoff(null)
            }
          }}
          candidateName={pendingLayoff.candidateName}
          onConfirm={(reason) => {
            saveLayoffReason(pendingLayoff.candidateId, reason)
            commitMove(pendingLayoff.candidateId, 'LAYOFF', pendingLayoff.revertTo)
            setPendingLayoff(null)
          }}
        />
      )}
    </div>
  )
}
