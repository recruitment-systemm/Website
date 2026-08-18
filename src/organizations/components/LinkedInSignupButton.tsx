import { Button } from '@/components/ui/button'
import { AUTH_SERVICE_BASE_URL } from '@/shared/api/httpClient'

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

/**
 * `GET /organizations/linkedin` is a full-page redirect straight to
 * LinkedIn's OAuth consent screen (`response.sendRedirect`, not JSON) —
 * this navigates the browser there directly rather than going through
 * `authClient`/`fetch`. LinkedIn then redirects back to the backend's own
 * callback, which lands the browser on `/signup/linkedin?token=...` here
 * once the LinkedIn profile is resolved.
 *
 * Signup-only: the backend's callback always creates a *new* organization
 * signup token, regardless of whether that LinkedIn account already has an
 * org — there's no "log me in" branch. So this only belongs on `/register`,
 * not `/login`.
 *
 * A full-page navigation can't set the `ngrok-skip-browser-warning` header
 * the way `httpClient`'s `fetch()` calls do, so when the backend is behind
 * a free-tier ngrok tunnel this would otherwise land on ngrok's "you're
 * about to visit..." interstitial instead of the real endpoint. ngrok
 * accepts the same flag as a query param for exactly this case.
 */
export function LinkedInSignupButton() {
  function handleClick() {
    window.location.href = `${AUTH_SERVICE_BASE_URL}/api/v1/organizations/linkedin?ngrok-skip-browser-warning=true`
  }

  return (
    <Button type="button" variant="outline" className="h-10 gap-2" onClick={handleClick}>
      <LinkedInMark />
      Continue with LinkedIn
    </Button>
  )
}
