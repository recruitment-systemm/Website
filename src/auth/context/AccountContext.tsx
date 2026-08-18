import { createContext, useContext } from 'react'
import type { CurrentAccount } from '@/auth/api/accountApi'

/** `undefined` while resolving, `null` if signed out. */
export const AccountContext = createContext<CurrentAccount | null | undefined>(undefined)

/**
 * The signed-in account (org or employee), resolved once by
 * `RequireOrganization` and shared from there — every dashboard page and the
 * dock read the same value instead of each independently calling
 * `getCurrentAccount()` (which itself tries up to two profile endpoints).
 * Only usable inside `/dashboard/*`, where the provider is mounted.
 */
export function useCurrentAccount(): CurrentAccount | null | undefined {
  return useContext(AccountContext)
}
