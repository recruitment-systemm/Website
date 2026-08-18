import { authClient } from '@/shared/api/httpClient'
import type { Organization } from '@/organizations/types/organization'
import type { EmployeeSession } from '@/auth/api/authApi'

export type CurrentAccount =
  | { type: 'organization'; organization: Organization }
  | { type: 'employee'; employee: EmployeeSession }

/**
 * Resolves whoever is signed in from the `Access` cookie, trying an
 * organization session first (the common case) and falling back to an
 * employee session. Both endpoints 401 when the cookie doesn't match their
 * principal type, so this is the only way to tell which kind of account is
 * signed in — the cookie itself is HttpOnly and unreadable from JS.
 */
export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  try {
    const organization = await authClient.get<Organization>('/api/v1/organizations/profile')
    return { type: 'organization', organization }
  } catch {
    // Not an organization session — fall through and try an employee one.
  }

  try {
    const employee = await authClient.get<EmployeeSession>('/api/v1/employees/profile')
    return { type: 'employee', employee }
  } catch {
    return null
  }
}
