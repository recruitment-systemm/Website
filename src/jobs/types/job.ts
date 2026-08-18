export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED'

export interface Job {
  id: string
  title: string
  description: string
  address: string
  latitude: number
  longitude: number
  status: JobStatus
  createdAt: string
  organizationId: string
  createdBy: string
  /**
   * Not returned by job-service's `JobResponse` — the mock's denormalized
   * name doesn't exist on the real backend and there's no batch org-lookup
   * endpoint to resolve it separately. Always `undefined` from real data;
   * left optional (rather than removed) so the couple of display sites can
   * degrade gracefully instead of being restructured.
   */
  organizationName?: string
}

export const JOB_STATUSES: readonly JobStatus[] = ['DRAFT', 'OPEN', 'CLOSED'] as const
