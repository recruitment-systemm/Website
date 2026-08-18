export type CandidateStage =
  | 'SOURCED'
  | 'IN_PROGRESS'
  | 'INTERVIEW'
  | 'HIRED'
  | 'REJECTED'
  | 'LAYOFF'

export interface Candidate {
  id: string
  /** The organization this candidate applied to — each org only sees its own. */
  organizationId: string
  jobId: string
  firstName: string
  lastName: string
  /** Computed once at the API mapping layer (`firstName + ' ' + lastName`). */
  name: string
  email: string
  phone?: string
  resumeUrl?: string
  stage: CandidateStage
  appliedAt: string
  updatedAt: string
  /** The job they applied for — resolved client-side from `listJobs()`/`listPublicJobs()` where needed, since `ApplicationResponse` only carries `jobId`. */
  appliedJobTitle?: string
}

export const CANDIDATE_STAGES = [
  'SOURCED',
  'IN_PROGRESS',
  'INTERVIEW',
  'HIRED',
  'REJECTED',
  'LAYOFF',
] as const satisfies readonly CandidateStage[]
