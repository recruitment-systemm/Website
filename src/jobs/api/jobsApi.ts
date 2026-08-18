import { jobClient } from '@/shared/api/httpClient'
import type { Job, JobStatus } from '@/jobs/types/job'

/** Jobs belonging to the signed-in employee's organization (requires an HR session). */
export async function listJobs(): Promise<Job[]> {
  try {
    return await jobClient.get<Job[]>('/api/v1/jobs/organization')
  } catch {
    return []
  }
}

/** Public, unauthenticated job board: every OPEN job across every organization. */
export async function listPublicJobs(): Promise<Job[]> {
  return jobClient.get<Job[]>('/api/v1/jobs')
}

/**
 * Every job across every organization, any status — for the admin console.
 *
 * BACKEND GAP: job-service has no admin cross-org listing endpoint.
 * `GET /jobs/organization` is scoped to the caller's own org via their
 * employee session, and an admin never holds an employee session at all (see
 * the auth model note in the integration report), so there's no request this
 * function can make that would return jobs from every organization. Returns
 * `[]` until that backend endpoint exists — do not fabricate data here.
 */
export async function listAllJobs(): Promise<Job[]> {
  return []
}

export async function updateJobStatus(jobId: string, status: JobStatus): Promise<void> {
  await jobClient.patch<void>(`/api/v1/jobs/${jobId}/status?status=${status}`)
}

export interface CreateJobPayload {
  title: string
  description: string
  address: string
  latitude: number
  longitude: number
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  return jobClient.post<Job>('/api/v1/jobs', payload)
}
