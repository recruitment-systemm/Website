import { ApiError, authClient } from '@/shared/api/httpClient'
import {
  clearAdminSession,
  hasAdminSession,
  setAdminSession,
} from '@/organizations/utils/organizationStore'
import { listAllJobs } from '@/jobs/api/jobsApi'
import { listAllCandidates } from '@/candidates/api/candidatesApi'
import { listOrganizationEmployeesForAdmin } from '@/users/api/usersApi'
import type { Organization, OrganizationStatus } from '@/organizations/types/organization'
import type { Job } from '@/jobs/types/job'
import type { Candidate } from '@/candidates/types/candidate'
import type { OrgUser } from '@/users/types/user'

export class InvalidAdminCredentialsError extends Error {
  constructor() {
    super('Invalid administrator credentials.')
    this.name = 'InvalidAdminCredentialsError'
  }
}

export async function adminLogin(email: string, password: string): Promise<void> {
  try {
    await authClient.post<void>('/api/v1/admin/login', { email, password })
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      throw new InvalidAdminCredentialsError()
    }
    throw error
  }

  setAdminSession()
}

export function adminLogout() {
  clearAdminSession()
}

export function isAdminSignedIn(): boolean {
  return hasAdminSession()
}

async function withAdminAuthGuard<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAdminSession()
    }
    throw error
  }
}

export async function listAllOrganizations(): Promise<Organization[]> {
  const organizations = await withAdminAuthGuard(() =>
    authClient.get<Organization[]>('/api/v1/admin/organizations')
  )
  return [...organizations].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  )
}

export async function setOrganizationStatus(
  id: string,
  status: OrganizationStatus
): Promise<void> {
  await withAdminAuthGuard(() =>
    authClient.patch<void>(`/api/v1/admin/organizations/${id}/status`, { status })
  )
}

export interface OrganizationDetail {
  organization: Organization
  jobs: Job[]
  candidates: Candidate[]
  employees: OrgUser[]
}

export async function getOrganizationDetail(id: string): Promise<OrganizationDetail | null> {
  let organization: Organization
  try {
    organization = await withAdminAuthGuard(() =>
      authClient.get<Organization>(`/api/v1/admin/organizations/${id}`)
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }

  const [allJobs, allCandidates, employees] = await Promise.all([
    listAllJobs(),
    listAllCandidates(),
    listOrganizationEmployeesForAdmin(id),
  ])

  return {
    organization,
    jobs: allJobs.filter((job) => job.organizationId === id),
    candidates: allCandidates.filter((candidate) => candidate.organizationId === id),
    employees,
  }
}
