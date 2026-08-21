import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentAccount, type CurrentAccount } from '@/auth/api/accountApi'
import { AccountContext } from '@/auth/context/AccountContext'
import { SESSION_INVALIDATED_EVENT } from '@/shared/api/httpClient'

type AuthState =
  | { status: 'checking' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; account: CurrentAccount }

/**
 * Route guard for `/dashboard/*`. Signed-out visitors go to `/login`; orgs
 * still awaiting review go to `/pending-approval`; rejected ones go to
 * `/registration-rejected`. Only the admin console (`/admin`) can move an
 * organization between those states.
 *
 * Employee (HR/Interviewer) sessions skip the status check entirely — an
 * employee account can only be created under an already-`ACCEPTED`
 * organization (see `EmployeeService.createEmployee` on the backend), so
 * there's no pending/rejected state for an employee to land in.
 */
export function RequireOrganization() {
  const [state, setState] = useState<AuthState>({ status: 'checking' })

  useEffect(() => {
    let cancelled = false
    getCurrentAccount().then((account) => {
      if (cancelled) return
      setState(account ? { status: 'signed-in', account } : { status: 'signed-out' })
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleSessionInvalidated() {
      setState((current) => {
        if (current.status !== 'signed-in') return current
        toast.warning('Signed out', {
          description: 'This account was signed in on another device, so you were signed out here.',
        })
        return { status: 'signed-out' }
      })
    }

    window.addEventListener(SESSION_INVALIDATED_EVENT, handleSessionInvalidated)
    return () => window.removeEventListener(SESSION_INVALIDATED_EVENT, handleSessionInvalidated)
  }, [])

  /**
   * A tab left open and idle on the dashboard never makes another request on
   * its own, so it would otherwise only notice a session replaced elsewhere
   * (see the module doc on `SESSION_INVALIDATED_EVENT`) the next time the
   * user happens to trigger a fetch. Re-checking on focus/visibility closes
   * that gap for the common case: switching back to this tab after signing
   * in somewhere else.
   */
  useEffect(() => {
    function recheckSession() {
      if (document.visibilityState !== 'visible') return
      setState((current) => {
        if (current.status !== 'signed-in') return current
        getCurrentAccount().then((account) => {
          if (account) return
          toast.warning('Signed out', {
            description: 'This account was signed in on another device, so you were signed out here.',
          })
          setState({ status: 'signed-out' })
        })
        return current
      })
    }

    window.addEventListener('focus', recheckSession)
    document.addEventListener('visibilitychange', recheckSession)
    return () => {
      window.removeEventListener('focus', recheckSession)
      document.removeEventListener('visibilitychange', recheckSession)
    }
  }, [])

  if (state.status === 'checking') {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (state.status === 'signed-out') {
    return <Navigate to="/login" replace />
  }

  if (state.account.type === 'employee') {
    return (
      <AccountContext.Provider value={state.account}>
        <Outlet />
      </AccountContext.Provider>
    )
  }

  const { organization } = state.account

  if (organization.status === 'REJECTED') {
    return <Navigate to="/registration-rejected" replace />
  }

  if (organization.status !== 'ACCEPTED') {
    return <Navigate to="/pending-approval" replace />
  }

  return (
    <AccountContext.Provider value={state.account}>
      <Outlet />
    </AccountContext.Provider>
  )
}
