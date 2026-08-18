import { ApiError, authClient } from '@/shared/api/httpClient'
import type { Organization } from '@/organizations/types/organization'

export interface RegisterOrganizationPayload {
  name: string
  email: string
  password: string
  taxRegistrationNumber: string
  taxRegistrationDocument: File
}

export type RegisterOrganizationResult = Organization

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('An organization with that email already exists.')
    this.name = 'EmailAlreadyRegisteredError'
  }
}

export async function registerOrganization(
  payload: RegisterOrganizationPayload
): Promise<RegisterOrganizationResult> {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('email', payload.email)
  formData.append('password', payload.password)
  formData.append('taxRegistrationNumber', payload.taxRegistrationNumber)
  formData.append('taxRegistrationDocument', payload.taxRegistrationDocument)

  try {
    return await authClient.post<Organization>('/api/v1/organizations', formData)
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new EmailAlreadyRegisteredError()
    }
    throw error
  }
}

export class InvalidLinkedInSignupTokenError extends Error {
  constructor() {
    super('This LinkedIn sign-up link has expired. Start over from the sign-in page.')
    this.name = 'InvalidLinkedInSignupTokenError'
  }
}

export interface CompleteLinkedInSignupPayload {
  token: string
  organizationName: string
  password: string
  taxRegistrationNumber: string
  taxRegistrationDocument: File
}

/**
 * Finishes an organization signup started via `GET /organizations/linkedin`.
 * The LinkedIn-provided email/name never pass through the browser as form
 * fields — the backend resolves them server-side from the short-lived
 * Redis-backed `token` (see `LinkedInSignupService`, 10-minute TTL), so this
 * form only ever asks for what LinkedIn *doesn't* already know: the
 * organization's name (not the signed-in person's name), a password, and
 * tax verification.
 */
export async function completeLinkedInSignup(
  payload: CompleteLinkedInSignupPayload
): Promise<RegisterOrganizationResult> {
  const formData = new FormData()
  formData.append('token', payload.token)
  formData.append('organizationName', payload.organizationName)
  formData.append('password', payload.password)
  formData.append('taxRegistrationNumber', payload.taxRegistrationNumber)
  formData.append('taxRegistrationDocument', payload.taxRegistrationDocument)

  try {
    return await authClient.post<Organization>('/api/v1/organizations/linkedin/signup/complete', formData)
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new EmailAlreadyRegisteredError()
    }
    if (error instanceof ApiError && error.status === 400) {
      throw new InvalidLinkedInSignupTokenError()
    }
    throw error
  }
}

/**
 * The signed-in organization, or null when there's no session. The cookie
 * JWT is HttpOnly, so this is the only way to know who (if anyone) is signed
 * in — there's no synchronous localStorage check anymore. Callers inside
 * `/dashboard` can still assume non-null once resolved: `RequireOrganization`
 * redirects to `/login` before rendering its children.
 */
export async function getCurrentOrganization(): Promise<Organization | null> {
  try {
    return await authClient.get<Organization>('/api/v1/organizations/profile')
  } catch {
    return null
  }
}
