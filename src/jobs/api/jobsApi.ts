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

/** Every job across every organization, any status — for the admin console. */
export async function listAllJobs(): Promise<Job[]> {
  try {
    return await jobClient.get<Job[]>('/api/v1/jobs/admin/all')
  } catch {
    return []
  }
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
