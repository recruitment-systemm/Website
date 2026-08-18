export const ADMIN_SESSION_STORAGE_KEY = 'hiredesk:admin-session'

/**
 * The real session lives entirely in HttpOnly `Access`/`Refresh` cookies set
 * by authentication-service — invisible to JS by design, so there is no
 * synchronous "am I signed in" check anymore. `getCurrentOrganization()`
 * (organizationsApi.ts) is the actual source of truth, resolved by calling
 * `GET /organizations/profile`. This module now only holds the one piece of
 * client-side state that has no server equivalent: the admin "session" flag.
 *
 * No `GET /admin/profile` endpoint exists, so admin liveness can't be
 * resolved the same way an org's can. We treat a successful admin login as
 * proof of a live session and clear the flag on any 401 from an admin
 * endpoint (see `adminApi.ts`) — an approximation, not a real session check,
 * documented here since it's the one non-obvious piece of this file.
 */
export function hasAdminSession(): boolean {
  try {
    return localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setAdminSession() {
  try {
    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true')
  } catch {
    // Session flag won't survive a refresh; the admin can sign in again.
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
  } catch {
    // Nothing to do — worst case the stale flag is simply ignored.
  }
}
