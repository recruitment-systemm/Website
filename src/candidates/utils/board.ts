import { CANDIDATE_STAGES, type Candidate } from '@/candidates/types/candidate'

export type BoardStage = (typeof CANDIDATE_STAGES)[number]

export type CandidateBoard = Record<BoardStage, Candidate[]>

export function groupByStage(candidates: Candidate[]): CandidateBoard {
  const board: CandidateBoard = {
    SOURCED: [],
    IN_PROGRESS: [],
    INTERVIEW: [],
    HIRED: [],
    REJECTED: [],
    LAYOFF: [],
  }
  for (const candidate of candidates) {
    board[candidate.stage].push(candidate)
  }
  return board
}

export function findStage(board: CandidateBoard, candidateId: string): BoardStage | null {
  for (const stage of CANDIDATE_STAGES) {
    if (board[stage].some((candidate) => candidate.id === candidateId)) return stage
  }
  return null
}

export function isStageId(id: string): id is BoardStage {
  return (CANDIDATE_STAGES as readonly string[]).includes(id)
}

/**
 * Mirrors `ApplicationService.ALLOWED_TRANSITIONS` on the backend exactly
 * (Application-Interview-Services) — the board is a strict state machine,
 * not a free-drag Kanban. Only these moves are legal:
 * SOURCED → IN_PROGRESS | REJECTED
 * IN_PROGRESS → INTERVIEW | REJECTED
 * INTERVIEW → HIRED | REJECTED
 * REJECTED → SOURCED (a deliberate "reconsider" path, not a bug)
 * HIRED → LAYOFF (the only way onto LAYOFF)
 * LAYOFF → (nothing — fully terminal, no transitions out anywhere in the backend)
 * Dragging a card to any other column is rejected client-side before the
 * PATCH is ever sent, since the backend would 409 it anyway.
 */
const ALLOWED_BOARD_TRANSITIONS: Record<BoardStage, readonly BoardStage[]> = {
  SOURCED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['HIRED', 'REJECTED'],
  HIRED: ['LAYOFF'],
  REJECTED: ['SOURCED'],
  LAYOFF: [],
}

export function isLegalStageMove(from: BoardStage, to: BoardStage): boolean {
  return from !== to && ALLOWED_BOARD_TRANSITIONS[from].includes(to)
}

/** Whether a card in this column has anywhere legal to be dragged — false for LAYOFF. */
export function hasAnyLegalMove(stage: BoardStage): boolean {
  return ALLOWED_BOARD_TRANSITIONS[stage].length > 0
}
